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
       
    

    
});