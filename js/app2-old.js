console.log('hello people222');

(function ($) {
    const cdsForm = $('#country-dropdown-select');
    const distributorSection = $('#distributor-section');
    const ldButton = cdsForm.find('.submit');
    var newCountryDropDown = new CreateCountryDropdown();

    $('.show-distributors-btn').on('click', function () {
        $.fancybox.open({
            src: '#locationModal',
            type: 'inline',
            opts: {
                smallBtn: false,
                toolbar: false,
                clickSlide: false,
                clickOutside: false,
                infobar: false,
                touch: {
                    vertical: false  // Allow to drag content vertically
                    //momentum : true   // Continuous movement when panning
                },
                beforeLoad: function (instance, current) {
                    localStorage.setItem('localStorage', 1);
                    localStorage.removeItem('localStorage');
                    newCountryDropDown.init();
                }
            }
        });
    });

    function CreateCountryDropdown() {
        this.countriesLoaded = false;
        this.distributorsLoaded = false;
        this.showClose = false;
        this.countryAPI = "js/countries.json";
        this.distributorAPI = "js/distributors.json";
        this.countriesArray = [];
        this.countryCompleteArray = [];
        this.selectedCountry = '';
        this.formHeight = null;
        this.messagesEl = null;


        this.init = function(){
            
            if (!this.countriesLoaded) {
                this.getCountriesArray().then((countries) => {
                    this.countriesArray = countries;
                    this.popup = $($.fancybox.getInstance().current.src)[0];
                    this.createMessages();
                    this.startDropdown();
                });
            }
        };
        this.createMessages = function(){
            let loadElement = document.createElement('div');
            $(loadElement).addClass('cds-messages hidden');
            this.messagesEl = loadElement;
            $(this.popup).append(loadElement);
        };
        this.startDropdown = function(){
            let self = this;
            $("#country-select").autocomplete({
                select: function (event, ui) {
                    let countryCode = self.findCountryCode(ui.item.value);
                    $('#country-select')[0].value = countryCode;
                    ldButton.trigger('click', countryCode);
                },
                close: function (event) {
                    $('#country-dropdown-select')[0].reset();
                },
                delay: 500,
                appendTo: "#country-dropdown-select",
                source: function (request, response) {
                    var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
                    console.log('Matcher:',matcher);
                    response($.grep(self.countriesArray, function (item) {
                        console.log('results: ',matcher.test(item));
                        return matcher.test(item);
                    }));
                }
            });
        };
        this.findCountryCode = function(country){
            if(country.length <= 0){
                return '&%&%%*%77';
            }
            country = this.capitalize(country)
            console.log('find country code', country);
            this.selectedCountry = country;
            let countryCode = '';
            for (let i = 0; i < this.countryCompleteArray.length; i++) {
                if (this.countryCompleteArray[i].country === country) {
                    countryCode = this.countryCompleteArray[i].countryCode;
                    return countryCode;
                    break;
                }
            }
            return false;
        };
        this.capitalize = function (str, force) {
            str = force ? str.toLowerCase() : str;
            return str.replace(/(\b)([a-zA-Z])/g,
                function (firstLetter) {
                    return firstLetter.toUpperCase();
                }
            );
        };
        this.getCountries =  function() {
            var self = this;
            console.log('get Countries');
            return new Promise(resolve => {
                setTimeout(() => {
                    $.getJSON(this.countryAPI, {
                        format: "json"
                    })
                    .done(function (data) {
                        self.countryCompleteArray = data;
                        let countryArray = $.map(data, function (val, i) {
                            return val.country;
                        });
                        resolve(countryArray);
                    })
                    .fail(function (e) {
                        console.log("Failed: ", e);
                    });
                }, 1500);
            });
        };
        this.getCountriesArray = async function () {
            let countries = await this.getCountries();
            return countries;
        };
        this.getDistributors = function (countryCode) {
            console.log('get Distributors', countryCode);
            return new Promise(resolve => {
                setTimeout(() => {
                    $.getJSON(this.distributorAPI, {
                        format: "json"
                    })
                        .done(function (data) {
                            let distributorArray = $.map(data, function (val, i) {
                                if (val.country_code === countryCode){
                                    return val;
                                }
                            });
                            resolve(distributorArray);
                        })
                        .fail(function (e) {
                            console.log("Failed: ", e);
                        });
                }, 1500);
            });
        };
        this.loadingIcon = function(boolean){
            if (boolean){
                let loadElement = document.createElement('div');
                $(loadElement).addClass('loading');
                let loadingGif = 'http://www.nerdycoder.com/travis/spinner.gif';
                let imageEl = document.createElement('img');
                $(imageEl).attr('src', loadingGif);
                loadElement.append(imageEl);
                $(this.popup).append(loadElement);
            } else if (!boolean) {
                $('.loading').remove();
            }
        };
        this.backBtn = function(boolean) {
            if(boolean){
                let backButton = document.createElement('a');
                $(backButton).addClass('back-to-country-finder');
                $('.distributor-header').append(backButton);
            } else if(!boolean){
                $('.back-to-country-finder').remove();
            }
        };
        this.backToCountryFinder = function(){
            this.backBtn(false);
            this.destroyDistributors();
        };
        this.destroyDistributors = function(){
            this.animateForm(false);
            distributorSection.empty();
        };
        this.animateForm = function(boolean) {
            //console.log(jQuery.type(formHeight));
            if (this.formHeight == null) {
                console.log('form height exist');
                this.formHeight = cdsForm.height();
            }
            if(boolean){
                cdsForm.animate({
                    marginTop: "-=" + this.formHeight + "",
                    opacity: "toggle",
                }, 500, function () {
                });
            } else if(!boolean){
                cdsForm.animate({
                    marginTop: "+=" + this.formHeight + "",
                    opacity: "toggle",
                }, 500, function () {
                });
            }
        };
        this.loadDistributors = function(country){
            this.loadingIcon(true);
            this.animateForm(true);
            if (!this.countriesLoaded) {
                this.getDistributorsArray(country).then((distributors) => {
                    if (distributors.length >= 1) {
                        let distributorList = this.parseDistributors(distributors);
                        this.loadingIcon(false);
                        this.buildDistributorsSection(distributorList);
                        this.backBtn(true);
                    } else {
                        this.message('No distributors in this country');
                        this.loadingIcon(false);
                        this.animateForm(false);
                    }
                });
            }
        };
        this.message = function(message) {
            let messagesEl = this.messagesEl;
            $(messagesEl)[0].innerHTML = "<span>" + message + "</span>";
            $(messagesEl).removeClass('hidden');
            setTimeout(function() {
                $(messagesEl).addClass('hidden');
            }, 4000);
        };
        this.getDistributorsArray = async function (countryCode) {
            let distributors = await this.getDistributors(countryCode);
            this.distributorsLoaded = true;
            return distributors;
        };
        this.buildDistributorsSection = function (distributorsList) {
            distributorSection.append(distributorsList);
        };
        this.parseDistributors = function (distributors) {
            var list = "<div class='distributor-header'><h3>" + this.selectedCountry + "</h3></div>";
                list += "<ul class='distributor-list'>";
            distributors.forEach(function (distributor, index) {
                list += "<li class='distributor'>";
                list += "<h4>" + distributor.title + "</h4>";
                list += "<p><span>Phone</span>: " + distributor.contact_number + "</p>";
                list += "<address>";
                list += "<p><span>Address:</span> " + distributor.address + "</p>";
                list += "<address>";
                list += "<p><span>Distributor Website:</span></br> " + distributor.website + "</p>";
                list += "</li>";
            });
            list += '</ul>'
            return list;
        };

    };

    ldButton.on('click', function(e, countryCode){
        e.preventDefault();
        if (countryCode != null){
            newCountryDropDown.loadDistributors(countryCode);
        } else if (countryCode == null){
            let value = $(this)[0].form.elements[0].value;
            let newCountryCode = newCountryDropDown.findCountryCode(value);
            if (!newCountryCode){
                newCountryDropDown.message('Country does not exist or can not be found');
            } 
            else if (newCountryCode === '&%&%%*%77'){
                newCountryDropDown.message('Please select a country from the input above');
            }
            else {
                $("#country-dropdown-select").trigger("reset");
                $("#country-select").autocomplete("close");
                newCountryDropDown.loadDistributors(newCountryCode);
            }
        }
    });

    distributorSection.on('click', '.back-to-country-finder', function(){
        newCountryDropDown.backToCountryFinder();
    });

})(jQuery);