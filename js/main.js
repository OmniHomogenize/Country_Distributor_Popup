var countriesUrl = 'https://codepen.io/theller5567/pen/pLMayr.js';
var distributorsUrl = 'https://codepen.io/theller5567/pen/JvdBKB.js';

console.log('LOADING COUNTRIES-222');
var bcp = {
    countriesLoaded: false,
    distributorsLoaded: false,
    showClose: false,
    getUrl: function () {
        var location = window.location
        return location.origin;
    },
    init: function () {
        bcp.topbar = parseInt($('.topbar').css('height'), 10);
        bcp.bottombar = parseInt($('.bottom-bar').css('height'), 10);
        if (!bcp.countriesLoaded) {
            bcp.addCountries().then((countries) => {
                bcp.popup = $($.fancybox.getInstance().current.src)[0];
                bcp.distributorArrays(countries);
            });
        } else {
            bcp.addEventListeners();
        }
    },
    toggleCountrySection: function () {
        $('#locationModal').find('.loading').toggleClass('show');
        $('.content').toggle();
    },
    getCountries: function () {
        console.log('get Countries');
        bcp.toggleCountrySection();
        return new Promise(resolve => {
            setTimeout(() => {
                $.ajax({
                    url: countriesUrl,
                    success: function (data) {
                        var results = JSON.parse(data);
                        resolve(results);
                    }
                });
            }, 1500);
        });
    },
    addCountries: async function () {
        var countries = await bcp.getCountries();
        bcp.toggleCountrySection();
        bcp.countriesLoaded = true;
        return countries;
    },
    getDistributors: function () {
        console.log('get Distributors');
        bcp.toggleCountrySection();
        return new Promise(resolve => {
            setTimeout(() => {
                $.ajax({
                    url: distributorsUrl,
                    success: function (data) {
                        var results = JSON.parse(data);
                        resolve(bcp.parseDistributors(results));
                    }, error: function (error) {
                        console.log('error', error);
                    }
                });
            }, 1500);
        });
    },
    addDistributors: async function () {
        var distributors = await bcp.getDistributors();
        bcp.distributorsLoaded = true;
        console.log(distributors);
        $('#distributorSection').append(distributors);
    },
    parseDistributors: function (distributors) {
        var list = "<h3>" + localStorage.getItem('countryName') + "</h3>";
        list += "<ul class='distributor-list'>";
        distributors.forEach(function (distributor, index) {
            console.log(distributor.distributor_title + index);
            list += "<li class='distributor'>";
            list += "<h4>" + distributor.distributor_title + "</h4>";
            list += "<p><span>Phone</span>: " + distributor.contact_number + "</p>";
            list += "<address>";
            list += "<p><span>Address:</span> " + distributor.address + "</p>";
            list += "<address>";
            list += "<a href='" + distributor.website + "'>" + distributor.website + "</a>";
            list += "</li>";
        });
        list += '</ul>'
        return list;
    },
    popupHeight: 0,
    countryArrays: {
        europeArr: [],
        europeArr1: [],
        europeArr2: [],
        namericaArr: [],
        samericaArr: [],
        otherArr: [],
        apacificArr: []
    },
    distributorArrays: function (arr) {
        bcp.numDistributors = arr;
        bcp.numDistributors.forEach(function (distributor) {
            var europeDis = distributor.distributorRegion === 'europe',
                namerica = distributor.distributorRegion === 'north america',
                samerica = distributor.distributorRegion === 'south america',
                other = distributor.distributorRegion === 'other',
                apacific = distributor.distributorRegion === 'asia/pacific';
            if (europeDis) {
                bcp.countryArrays.europeArr.push(distributor);
            }
            if (namerica) {
                bcp.countryArrays.namericaArr.push(distributor);
            }
            if (samerica) {
                bcp.countryArrays.samericaArr.push(distributor);
            }
            if (other) {
                bcp.countryArrays.otherArr.push(distributor);
            }
            if (apacific) {
                bcp.countryArrays.apacificArr.push(distributor);
            }
            return bcp.countryArrays;
        });
        bcp.sortCountries();
        bcp.splitEurope();
    },
    splitEurope: function () {
        let counter = 0;
        if (bcp.countryArrays.europeArr.length) {
            var europeLength = bcp.countryArrays.europeArr.length;
            bcp.countryArrays.europeArr.forEach(function (dis) {
                if (counter <= (europeLength / 2)) {
                    bcp.countryArrays.europeArr1.push(dis);
                    counter++;
                } else if (counter > (europeLength / 2)) {
                    bcp.countryArrays.europeArr2.push(dis);
                }
            });
        }
        bcp.buildList();
    },
    sortCountries: function () {
        var arr = bcp.countryArrays;
        var count = 0;
        var i;
        for (i in arr) {
            if (arr.hasOwnProperty(i)) {
                count++;
            }
        }
        var lengths = $(arr).length;
        if (count) {
            for (var i = 0; i < count; i++) {
                let name = Object.keys(arr)[i];
                arr[name].sort(function (a, b) {
                    if (a.country < b.country) return -1;
                    if (a.country > b.country) return 1;
                    return 0;
                });
            }
        }
        return arr;
    },
    titleCase: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    createList: function (scope) {
        var country = scope;
        var cc = country.countryCode;
        var ccc = cc.toUpperCase();
        var countryName = bcp.titleCase(country.country);
        var altVal = ccc + ' ' + countryName;
        if (ccc) {
            if (ccc === 'US') {
                var listItem = '<li class="country"><a class="highlight-country" href="#" alt="' + altVal + '">' + countryName + '</a></li>';
                return listItem;
            }
            var listItem = '<li class="country"><a href="#" alt="' + altVal + '">' + countryName + '</a></li>';
            return listItem;
        }
    },
    getCountryData: function () {
        var values = $(this).children().attr('alt');
        var dataCountry = values.substr(0, values.indexOf(' '));
        console.log(dataCountry);
        var dataCountryName = values.substr(values.indexOf(' ') + 1);
        $("#dataCountry").val(dataCountry);
        $("#dataCountryName").val(dataCountryName);
        localStorage.setItem('countryCode', dataCountry);
        localStorage.setItem('countryName', dataCountryName);
        var countryData = {
            'countryCode': dataCountry,
            'countryName': dataCountryName
        }
        console.log('test: ', dataCountry);
        if (dataCountry === 'US' || dataCountry === 'CA') {
            bcp.closeModule();
            alert('United States and Canada\'s \ Distributor is set by default and covered by "Company Name"');
        } else {
            bcp.toggleScreen();
            bcp.buildDistributors(countryData);
        }
    },
    removeEventListeners: function () {
        var countries = $('li.country');
        var goback = $('.go-back');
        for (var i = 0; i < countries.length; i++) {
            countries[i].removeEventListener('click', bcp.getCountryData, false);
        }
        for (var i = 0; i < goback.length; i++) {
            goback[i].addEventListener('click', bcp.goBack, false);
        }
    },
    addEventListeners: function () {
        $('.fancybox-inner').css({ height: 'auto', minHeight: '430px' });
        var countries = $('li.country');
        var goback = $('.go-back');
        console.log('countries', countries);
        for (var i = 0; i < countries.length; i++) {
            countries[i].addEventListener('click', bcp.getCountryData, false);
        }
        for (var i = 0; i < goback.length; i++) {
            goback[i].addEventListener('click', bcp.goBack, false);
        }
    },
    goBack: function () {
        if (bcp.distributorsLoaded) {
            bcp.toggleScreen();
            var sumHeight = bcp.bottombar + bcp.bottombar + parseInt($('#countrySection').css('height'), 10) + 'px';
            $(bcp.popup).css('height', sumHeight);
        }
    },
    toggleScreen: function () {
        $('#countrySection').toggleClass('hide');
        $('#distributorSection').toggleClass('show');
        $('.selectCountry').toggleClass('hide');
        $('.selectDistributor').toggleClass('hide');
        $('.remember-me').toggleClass('hide');
        $('.distributor-bar').toggleClass('show');
    },
    buildDistributors: function (data) {
        var country = data.countryName;
        $(".go-back").prop("disabled", true);
        $('#distributorSection').empty();
        bcp.addDistributors().then((distributors) => {
            var listHeight = $('#distributorSection').height();
            $(".go-back").prop("disabled", false);
            $('#locationModal').height(listHeight + 110);
            bcp.toggleCountrySection();
            bcp.clickedDistributor(data);
        });
    },
    clickedDistributor: function (data) {
        $('.distributor-list').find('li').on('click', function (el) {
            el = $(el.currentTarget);
            var distributor = el.find('h4')[0].innerText;
            localStorage.setItem('distributorName', distributor);
            localStorage.setItem('countryCode', data.countryCode);
            localStorage.setItem('countryName', data.countryName);
            $('.go-back').click();
            bcp.closeModule();
        });
    },
    closeModule: function () {
        $.fancybox.destroy();
        bcp.removeEventListeners();
    },
    buildList: function () {
        let europeList1 = $('.europe').find('.left'),
            europeList2 = $('.europe').find('.right'),
            namericaList = $('.north_america').find('ul'),
            samericaList = $('.south_america').find('ul'),
            otherList = $('.other').find('ul'),
            apacificList = $('.asia_pacific').find('ul');
        if (bcp.countryArrays.europeArr.length) {
            bcp.countryArrays.europeArr1.forEach(function (_thisCountry) {
                europeList1.append(bcp.createList(_thisCountry));
            });
            bcp.countryArrays.europeArr2.forEach(function (_thisCountry) {
                europeList2.append(bcp.createList(_thisCountry));
            });
        }
        if (bcp.countryArrays.namericaArr.length) {
            bcp.countryArrays.namericaArr.forEach(function (_thisCountry) {
                namericaList.append(bcp.createList(_thisCountry));
            });
        }
        if (bcp.countryArrays.samericaArr.length) {
            bcp.countryArrays.samericaArr.forEach(function (_thisCountry) {
                samericaList.append(bcp.createList(_thisCountry));
            });
        }
        if (bcp.countryArrays.otherArr.length) {
            bcp.countryArrays.otherArr.forEach(function (_thisCountry) {
                otherList.append(bcp.createList(_thisCountry));
            });
        }
        if (bcp.countryArrays.apacificArr.length) {
            bcp.countryArrays.apacificArr.forEach(function (_thisCountry) {
                apacificList.append(bcp.createList(_thisCountry));
            });
        }
        bcp.countriesLoaded = true;
        bcp.popupHeight = $(bcp.popup).css('height');
        bcp.addEventListeners();
    }
};

function buildArray() {
    bcp.init();
}

var continentButton = $('.continent');
function clickedCountry(e) {
    console.log('clicked country');
    var allLists = $(this).offsetParent().find('ul');
    var chs = e.currentTarget.parentElement;
    var selectedCountry = $(chs).find('ul');
    for (var i = 0; i < allLists.length; i++) {
        if (allLists[i] !== selectedCountry[0]) {
            if ($(selectedCountry[0]).hasClass('left')) {
                i++;
            }
            $(allLists[i]).removeClass('mobile-open');
        }
    }
    selectedCountry.toggleClass('mobile-open');
}
// THROTTLING THE WINDOW RESIZE EVENT
var timeout = false,
    delay = 250;
checkSize();
// CHECK IF MEDIA QUERY IS ACTIVATED FOR MIN WIDTH
function checkSize() {
    if ($("#locationModal").css("min-width") == "90%") {
        for (var i = 0; i < continentButton.length; i++) {
            continentButton[i].addEventListener('click', clickedCountry, false);
        }
    } else {
        for (var i = 0; i < continentButton.length; i++) {
            continentButton[i].removeEventListener('click', clickedCountry, false);
        }
    }
}
window.addEventListener('resize', function () {
    clearTimeout(timeout);
    var timeout = setTimeout(checkSize, delay);
});

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
                if (typeof localStorage === 'object') {
                    try {
                        localStorage.setItem('localStorage', 1);
                        localStorage.removeItem('localStorage');
                        buildArray();
                    } catch (e) {
                        Storage.prototype._setItem = Storage.prototype.setItem;
                        Storage.prototype.setItem = function () { };
                        console.log('Your web browser does not support storing settings locally. In Safari, the most common cause of this is using "Private Browsing Mode". Some settings may not save or some features may not work properly for you.');
                    }
                }
            }
        }
    });
});
