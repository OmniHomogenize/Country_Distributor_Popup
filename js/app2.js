"use strict";

(function ($) {
    const ccd = {
        cdsForm: $('#country-dropdown-select'),
        distributorSection: $('#distributor-section'),
        cdsFormInput: $('#country-select'),
        ldButton: $('#country-dropdown-select').find('.submit'),
        newCountryDropDown: new CreateCountryDropdown(),
        fbInstance: null,
    }
    

    function CreateCountryDropdown() {
        const countryAPI = "js/countries.json",
              distributorAPI = "js/distributors.json";
        let countriesLoaded = false,
            distributorsLoaded = false,
            created = false,
            countriesArray = [],
            countryCompleteArray = [],
            selectedCountry = null,
            selectedDistributor = null,
            formHeight = null,
            messagesEl = null,
            closePopupCreated = false,
            lsCountry = null,
            lsDistrbiutor = null;

        this.init = function(){
            let lsCountry = localStorage.getItem('country');
            let lsDistrbiutor = localStorage.getItem('distributor');
            if (lsCountry != null && lsDistrbiutor != null){
                if (lsCountry.length > 1 && lsDistrbiutor.length > 1) {
                    selectedCountry = lsCountry;
                    selectedDistributor = lsDistrbiutor;
                    this.createCloseBtn(true);
                }
            }
            
            if(!created){
                this.createMessages();
                if (!countriesLoaded) {
                    this.getCountriesArray().then((countries) => {
                        countriesArray = countries;
                        this.popup = $($.fancybox.getInstance().current.src)[0];
                        this.startDropdown(countries);
                    }).catch(function (error) {
                        console.log('Promise rejected - Countries', error);
                        self.unableToLoad(false, 'Currently unable to load distributor countries, please check your internet connection or contact sales.');
                    });
                } else {
                    ccd.cdsFormInput.focus();
                }
            } else {
                // Already been created!
                ccd.cdsForm[0].reset();
                ccd.cdsFormInput.focus();
            }
        };
        this.createMessages = function(){
            created = true;
            let loadElement = document.createElement('div');
            $(loadElement).addClass('cds-messages hidden');
            messagesEl = $(loadElement);
            $('#autocomplete').append(loadElement);
        };
        this.startDropdown = function(countryArr){
            let self = this;
            let countrySelect = $("#country-select");
            countrySelect.focus();
            let stringQuery = '';
            ccd.cdsFormInput.autocomplete({
                appendTo: $('#autocomplete'),
                maxHeight: 150,
                lookup: function (query, done) {
                    let result = { suggestions: countryArr };
                    let matcher = new RegExp("^" + query, "i");
                    let sugest = $.map(result.suggestions, function (item) {
                        if (matcher.test(item.value)) {
                            return item;
                        }
                    });
                    result.suggestions = sugest;
                    done(result);
                },
                onSelect: function (suggestion) {
                    let country = self.capitalize(suggestion.value);
                    selectedCountry = country;
                    localStorage.setItem('country', selectedCountry);
                    countrySelect[0].value = suggestion.value;
                    ccd.ldButton.trigger('click', suggestion.data);
                },
                delay: 500
            });
        };
        this.findCountryCode = function(country){
            if(country.length <= 0){
                return '&%&%%*%77';
            }
            country = this.capitalize(country);
            selectedCountry = country;
            let countryCode = '';
            for (let i = 0; i < countryCompleteArray.length; i++) {
                if (countryCompleteArray[i].country === country) {
                    countryCode = countryCompleteArray[i].countryCode;
                    return countryCode;
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
            let loadingMsg = 'Loading distributor countries';
            this.loadingIcon(true, loadingMsg);
            return new Promise(resolve => {
                setTimeout(() => {
                    $.getJSON(countryAPI, {
                        format: "json"
                    })
                    .done(function (data) {
                        let result = data;
                        self.countryCompleteArray = result;
                        let countryArray = $.map(result, function (country) {
                            let newOb = { value: country.country, data: country.countryCode };
                            return newOb;
                        });
                        console.log('countryArray Length:', countryArray.length);
                        if(countryArray.length > 1){
                            resolve(countryArray);
                        } else {
                            reject();
                        }
                    })
                    .fail(function (error) {
                        self.unableToLoad(false, 'Currently unable to load distributor countries, please check your internet connection or contact sales.');
                    });
                }, 1500);
            });
        };
        this.getCountriesArray = function () {
            let self = this;
            return this.getCountries().then(function(countries) {
                self.loadingIcon(false);
                return countries;
            });
        };
        this.getDistributors = function (countryCode) {
            let self = this;
            return new Promise(resolve => {
                setTimeout(() => {
                    $.getJSON(distributorAPI, {
                        format: "json"
                    })
                        .done(function (data) {
                            let distributorArray = $.map(data, function (val, i) {
                                if (val.country_code === countryCode){
                                    return val;
                                }
                            });
                            if (distributorArray){
                                resolve(distributorArray);
                            } else {
                                reject();
                            }
                        })
                        .fail(function (error) {
                            self.unableToLoad(true, error);
                        });
                }, 1500);
            });
        };
        this.unableToLoad = function(hideSearch, msg){
            let message = 'Currently unable to load distributors, please check your internet connection or contact sales.';
            if(msg){
                let mesaage = msg;
            }
            if (hideSearch){
                this.backToCountryFinder();
            }
            this.loadingIcon(false);
            this.callMessage(message);
        };
        this.loadingIcon = function(boolean, msg){
            if (boolean){
                if(msg === undefined){
                    msg = "Loading";
                }
                var loadElement = document.createElement('div');
                $(loadElement).addClass('loading');
                let loadingGif = 'http://www.nerdycoder.com/travis/spinner.gif';
                let imageEl = document.createElement('img');
                $(imageEl).attr('src', loadingGif);
                $(loadElement).append(imageEl);
                if(msg != null){
                    let loadingMessage = document.createElement('div');
                    loadingMessage.innerHTML = "<span>" + msg + "</span>";
                    $(loadElement).append(loadingMessage);
                }
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
            this.createCloseBtn(false);
            ccd.cdsForm[0].reset();
            ccd.cdsFormInput.focus();
            this.destroyDistributors();
        };
        this.destroyDistributors = function(){
            ccd.distributorSection.addClass('hidden');
            this.animateForm(false);
            ccd.distributorSection.empty();
        };
        this.animateForm = function(boolean) {
            if (formHeight == null) {
                formHeight = ccd.cdsForm.height();
            }
            if(boolean){
                ccd.cdsForm.animate({
                    marginTop: "-=" + formHeight + "",
                    opacity: "toggle",
                }, 500);
            } else if(!boolean){
                ccd.cdsForm.animate({
                    marginTop: "+=" + formHeight + "",
                    opacity: "toggle",
                }, 500);
            }
        };
        this.loadDistributors = function(country){
            let self = this;
            let loadingMsg = 'Loading distributors for ' + selectedCountry;
            this.loadingIcon(true, loadingMsg);
            if (!countriesLoaded) {
                this.getDistributorsArray(country).then((distributors) => {
                    if(distributors.length >= 1){
                        self.animateForm(true);
                        self.loadingIcon(false);
                        return distributors;
                    } else {
                        this.callMessage('No distributors in this country');
                        this.loadingIcon(false);
                    }
                }).then((distributors) => {
                    setTimeout(function () {
                        let distributorList = self.parseDistributors(distributors);
                        self.buildDistributorsSection(distributorList);
                        ccd.fbInstance.update();
                        self.backBtn(true);
                        ccd.distributorSection.removeClass('hidden');
                    }, 600);
                }).catch(function (error) {
                    console.log('Promise rejected - Distributors', error);
                    self.unableToLoad(false, 'Currently unable to load distributors, please check your internet connection or contact sales.');
                });
            }
        };
        this.callMessage = function(msg){
            let self = this;
            this.message(msg).then(function() {
                self.messageComplete(self);
            });
        };
        this.message = function(message) {
            let messages = $(messagesEl);
            messages[0].innerHTML = "<span>" + message + "</span>";
            messages.removeClass('hidden');
            return new Promise(function (resolve, reject) {
                setTimeout((function () {
                    resolve(messages);
                }), 3000);
            });
        };
        this.messageComplete = function (self){
            $(self.messagesEl).addClass('hidden');
            $(self.messagesEl).empty();
            return 'Messages Cleared!';
        },
        this.getDistributorsArray = function (countryCode) {
            return this.getDistributors(countryCode).then(function (distributors){
                distributorsLoaded = true;
                return distributors;
            });
        };
        this.buildDistributorsSection = function (distributorsList) {
            ccd.distributorSection.append(distributorsList);
            if(selectedDistributor != null && selectedCountry != null){
                this.createCloseBtn(true);
            }
        };
        this.parseDistributors = function (distributors) {
            var list = "<div class='distributor-header'><h3>" + selectedCountry + "</h3></div>";
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
        this.closePopup = function(){
            $.fancybox.close();
            if(!ccd.distributorSection.hasClass('hidden')){
                this.destroyDistributors();
            }
            this.createCloseBtn(false);
           
        };
        this.createCloseBtn = function(boolean){
            let self = this;
            if (!closePopupCreated){
                if (boolean) {
                    closePopupCreated = true;
                    let closeButton = document.createElement('a');
                    $(closeButton).addClass('close-popup');
                    closeButton = closeButton;
                    $('#locationModal').append(closeButton);
                    $(closeButton).on('click', function () {
                        self.closePopup();
                    });
                } else {
                    $('.close-popup').off('click');
                    $('.close-popup').remove();
                    closePopupCreated = false;
                }
            }
            
        };
    };

    $('.show-distributors-btn').on('click', function () {
        ccd.fbInstance = $.fancybox.open({
            src: '#locationModal',
            type: 'inline',
            opts: {
                smallBtn: false,
                toolbar: false,
                clickSlide: false,
                clickOutside: false,
                infobar: false,
                touch: false,
                beforeLoad: function (instance, current) {
                    localStorage.setItem('localStorage', 1);
                    localStorage.removeItem('localStorage');
                    ccd.newCountryDropDown.init();
                }
            }
        });
    });

    ccd.distributorSection.on('click', '.distributor', function () {
        let distributorSelected = $(this)[0].childNodes[0].innerText;
        localStorage.setItem('distributor', distributorSelected);
        ccd.newCountryDropDown.closePopup();
    });

    ccd.ldButton.on('click', function(e, countryCode){
        e.preventDefault();
        if (countryCode != null){
            ccd.newCountryDropDown.loadDistributors(countryCode);
        } else if (countryCode == null){
            let value = $(this)[0].form.elements[0].value;
            let newCountryCode = ccd.newCountryDropDown.findCountryCode(value);
            if (!newCountryCode){
                ccd.newCountryDropDown.callMessage('Country does not exist or can not be found');
            } 
            else if (newCountryCode === '&%&%%*%77'){
                ccd.newCountryDropDown.callMessage('Please enter a country in the input above');
            }
            else {
                $("#country-select").autocomplete("close");
                ccd.newCountryDropDown.loadDistributors(newCountryCode);
            }
        }
    });

    ccd.distributorSection.on('click', '.back-to-country-finder', function(){
        ccd.newCountryDropDown.backToCountryFinder();
    });

})(jQuery);