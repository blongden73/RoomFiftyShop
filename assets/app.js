$(document).ready(function () {

    
    var collectionGrid = '#shopify-section-collection-template .scroll-container';
    var collectionGridInner = collectionGrid + ' .scroll-container-inner';
    var gridProduct = collectionGridInner + ' .product';
    var isCollection = $('body').hasClass('template-collection');
    let 
        pagNext = '.custom-next a',
        pagHide = '.pag-hide',
        pagStatus = '.page-load-status';
    

    if (isCollection) {

        console.log('is a collection')

        $(collectionGridInner).infiniteScroll({
            // options
            path: pagNext,
            append: gridProduct,
            hideNav: pagHide,
            scrollThreshold: 600,
            status: pagStatus
        });
    
        $(collectionGridInner).on( 'request.infiniteScroll', function() {
            $(pagHide).hide()
            console.log('threshold')
        });
    
        $(collectionGridInner).on( 'append.infiniteScroll', function (items) {
            console.log('append');s
        });
    } else {
        console.log('not a collection')
    }

    var optionSelector = 'select#print-selector';
    var optionSelectorOption = optionSelector + ' option';

    $(optionSelectorOption).each(function() {
        if($(this).is(':selected')) {
            $(this).addClass('selected-print')
        }
    })

    $(optionSelector).on('change', function () {
       
        $(optionSelectorOption).each(function() {
            if($(this).is(':selected')) {
                $(this).addClass('selected-print')
            } else {
                $(this).removeClass('selected-print')
            }
        })

    })
       
    if (isCollection) {

        var header = '.template-collection #shopify-section-header';
        var collectionMain = '.template-collection main';

            console.log('fix header')
            $(header).addClass('on-scroll')
            $(collectionMain).addClass('on-scroll')

    } else {
        $(header).removeClass('on-scroll')
        $(collectionMain).removeClass('on-scroll')
        console.log('unfix header')
    }


    let mainNav = '.site-header nav ul',
        mainNavWidth = $(mainNav).width(),
        subMenu = '.sub-menu',
        subMenuInner = $(subMenu + ' .sub-menu-inner'),
        subMenuWrap = subMenu + ' .child-wrap',
        collHeader = 'section.collection-header .coll-header-wrapper'
        $link = $(mainNav + ' li a')
        $mainNavlink = $(mainNav + ' li a.has-child'),
        childList = subMenuWrap;


        subMenuInner.width(mainNavWidth);

        $(window).resize(function () {
            subMenuInner.width(mainNavWidth); 
            console.log('resize to' + mainNavWidth)
        })


    $link.hover(function () {
        
        var linkCheck = $(this).hasClass('has-child');

        if (linkCheck) {
            $(subMenu).addClass('active')
        
            if (isCollection) {
                $(collHeader).addClass('coll-move');
                $(collHeader).css('z-index', '-1');
                $(collHeader).css('opacity', '0');
            }
        } else {
      
            $(subMenu).removeClass('active')

            if (isCollection) {
                $(collHeader).removeClass('coll-move');
                $(collHeader).css('z-index', '10000');
                $(collHeader).css('opacity', '1');
            }
        }
       
    })

    $(subMenu).on('mouseleave', function() {

        $(subMenu).removeClass('active')

        if (isCollection) {
            $(collHeader).removeClass('coll-move');
            $(collHeader).css('z-index', '10000');
            $(collHeader).css('opacity', '1');
        }
    })

    
    $mainNavlink.hover(function(event) {

        event.preventDefault();

        var filter = $(this).data('filter')
        var filterClass = '.' + filter;

        console.log(filter)

        let filterMatch = $(childList).hasClass(filter),
            $filterMatch = $(childList + filterClass),
            $filterFalse = $(childList).not(filterClass),
            $tabFalse = $mainNavlink.not(filterClass);


        if (filterMatch) {
            $(this).addClass('active-visible');
            $filterMatch.addClass('active-visible');
            $filterFalse.removeClass('active-visible');
            $tabFalse.removeClass('active-visible');
        }

    })

   

    // if (isCollection && subActiveCheck) {
    //     $(collHeader).addClass('coll-move');
    // } else {
    //     $(collHeader).removeClass('coll-move');
    // }

  

    
});