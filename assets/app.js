$(document).ready(function () {


    var collectionGrid = '#shopify-section-collection-template .scroll-container';
    var collectionGridInner = collectionGrid + ' .scroll-container-inner';
    var gridProduct = collectionGridInner + ' .product'
    
    let 
        pagNext = '.custom-next a',
        pagHide = '.pag-hide',
        pagStatus = '.page-load-status';
    
    $(collectionGridInner).infiniteScroll({
        // options
        path: pagNext,
        append: gridProduct,
        hideNav: pagHide,
        scrollThreshold: 600,
        status: pagStatus
    });

    $(collectionGridInner).on( 'request.infiniteScroll', function() {
        $(pagHide).hide();
        // $(gridProduct).removeClass('slide-up-animation')
        // $(gridProduct).removeClass('animated')
        console.log('threshold')
    });

    $(collectionGridInner).on( 'append.infiniteScroll', function (items) {
        console.log('append');
        console.log(items)
        // $(gridProduct).addClass('slide-up-animation');
        // $(gridProduct).addClass('animated');
    });
    
});