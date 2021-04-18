$(document).ready(function () {

        // Add to Cart Form –––––––––––––––––––––––––––
    
        let
            addToCartFormSelector = '.add-to-cart-form',
            productOptionSelector = addToCartFormSelector + ' [name*=option]';
            
        let productForm = {
        onProductOptionChanged: function(event) {
            let
                $form = $(this).closest(addToCartFormSelector),
                selectedVariant = productForm.getActiveVariant($form);

            $form.trigger('form:change', [selectedVariant])
            
            // console.log($form)
                // console.log($form.attr('data-variants'))
        },
        getActiveVariant: function($form) {
            let
                variants = JSON.parse(decodeURIComponent($form.attr('data-variants'))),
                formData = $form.serializeArray(),
                formOptions = {
                    option1: null,
                    option2: null,
                    option3: null
                },
                selectedVariant = null;


            $.each(formData, function(index, item) {
                if (item.name.indexOf('option') !== -1) {
                    formOptions[item.name] = item.value;
                }
            });

            $.each(variants, function(index, variant) {
                if (variant.option1 === formOptions.option1 && variant.option2 === formOptions.option2 && variant.option3 === formOptions.option3) {
                  selectedVariant = variant;
                  return false;
                }
              });

            console.log(variants)
            console.log(formOptions)

            return selectedVariant;
        },
        validate: function(event, selectedVariant) {
            console.log('form validate');
            console.log(selectedVariant);

            let
                $form = $(this).closest(addToCartFormSelector),
                hasVariant = selectedVariant !== null,
                canAddToCart = hasVariant,
                $id = $form.find('.js-variant-id'),
                $addToCartButton = $form.find('.add-to-cart-button'),
                $price = $form.find('.js-price'),
                formattedVariantPrice = null,
                priceHtml = null,
                addMsg = '.add-to-cart-button .add-msg',
                priceWrap = '.add-to-cart-button h3 .price-wrap',
                formID = $form.attr('id'),
                localAddMsg = '#' + formID + ' ' + addMsg,
                localPriceWrap =  '#' + formID + ' ' + priceWrap,
                localButton =  '#' + formID + ' .add-to-cart-button';

                if (hasVariant) {
                    formattedVariantPrice = '£' + (selectedVariant.price/100).toFixed(2);
                    priceHtml = '<span class="money">' + formattedVariantPrice + '</span>';
                    window.history.replaceState(null, null, '?variant=' + selectedVariant.id);
                    // $(addMsg).html('Add to Bag');
                } else {
                    priceHtml = $price.attr('data-default-price');
                }

                

                if (canAddToCart) {

                    console.log(formID)
                    $id.val(selectedVariant.id);
                    $(localButton).prop('disabled', false);
                    $addToCartButton.removeClass('unavailable');
                    
                    $(localAddMsg).html('Add to Bag')
                    $(localPriceWrap).removeClass('visually-hidden')
                    
                    
                    
                } else if (!canAddToCart) {

                    console.log('disabled')

                    $id.val('');
                    $(localButton).prop('disabled', true);
                    $addToCartButton.addClass('unavailable');
                    $(localPriceWrap).addClass('visually-hidden')
                    
                    $(localAddMsg).html('Select Coffee')
                    
                    // $(addMsg).html('Out of Stock')
                }

                $price.html(priceHtml);
                
                console.log(canAddToCart);

        },
        init: function () { 
            $(document).on('change', productOptionSelector, productForm.onProductOptionChanged);
            $(document).on('form:change', addToCartFormSelector, productForm.validate);
        }
    };
    
    productForm.init();



// Ajax Cart –––––––––––––––––––––––––––––––––

let 
    miniCartContentSelector = '.js-mini-cart-contents';

let ajaxify = {
    onAddToCart: function (event) {
        event.preventDefault();
    
        $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: $(this).serialize(),
        dataType: 'json',
        success: ajaxify.onCartUpdated,
        error: ajaxify.onError
        });
    },
    onCartUpdated: function() {
        
    let
        $miniCartFieldset = $(miniCartContentSelector + '.js-cart-fieldset');
        
        $miniCartFieldset.prop('disabled', true);


    $.ajax({
        type: 'GET',
        url: '/cart',
        context: document.body,
        success: function(context) {
        let
            $dataCartContents = $(context).find('.js-cart-page-contents'),
            dataCartHtml = $dataCartContents.html(),
            dataCartItemCount = $dataCartContents.attr('data-cart-item-count'),
            $miniCartContents = $(miniCartContentSelector),
            $cartItemCount = $('.js-cart-item-count');

        $cartItemCount.text(dataCartItemCount);
        $miniCartContents.html(dataCartHtml);
        // currencyPicker.onMoneySpanAdded();

        console.log('added')

        if (parseInt(dataCartItemCount) > 0) {
            ajaxify.openCart(); 
        }
        else {
            ajaxify.closeCart();
        }
        }
    });
    },
    onError: function(XMLHttpRequest, textStatus) {
    let data = XMLHttpRequest.responseJSON;
    alert(data.status + ' - ' + data.message + ': ' + data.description);
    console.log('error')
    },
    onCartButtonClick: function(event) {
        event.preventDefault();
    
        let isCartOpen = $('html').hasClass('mini-cart-open');
    
        if (!isCartOpen) {
            ajaxify.openCart();
        }
        else {
            ajaxify.closeCart();
        }
    },
    openCart: function() {
        $('html').addClass('mini-cart-open'); 
        // $('#mini-cart').removeClass('visually-hidden');
        // $('#mini-cart').removeClass('mini-cart-close');
    },
    closeCart: function() {
        $('html').removeClass('mini-cart-open');
        // $('#mini-cart').addClass('visually-hidden');
        // $('html').addClass('mini-cart-close');
    }, 
    init: function() {
        $(document).on('submit', addToCartFormSelector, ajaxify.onAddToCart);
        $(document).on('click', '.cart-close', ajaxify.closeCart);
        $(document).on('click', '.js-cart-link', ajaxify.onCartButtonClick);
        
    }
}

ajaxify.init();


// Line Item –––––––––––––––


let 
    removeLineSelector = '.js-remove-line',
    lineQuantitySelector = '.js-line-quantity';

let lineItem = {
    isInMiniCart: function(element) {
        let
            $element = $(element),
            $miniCart = $element.closest(miniCartContentSelector),
            isInMiniCart = $miniCart.length !== 0;

        return isInMiniCart;

    },
    onLineQuantityChanged: function () {
        let 
            quantity = this.value, 
            id = $(this).attr('id').replace('updates_', '');
            changes = {
                quantity: quantity,
                id: id
            },
            isInMiniCart = lineItem.isInMiniCart(this);
            
            console.log(changes)

            if (isInMiniCart) {
                $.post('/cart/change.js', changes, ajaxify.onCartUpdated, 'json');
            }
    },
    onLineRemoved: function(event) {

        let 
            isInMiniCart = lineItem.isInMiniCart(this);

        if (isInMiniCart) {

            event.preventDefault();
            
            let
                $removeLink = $(this),
                removeQuery = $removeLink.attr('href').split('change?')[1];

            $.post('/cart/change.js', removeQuery, ajaxify.onCartUpdated, 'json');
        }
    },
    init: function() {
        $(document).on('click', removeLineSelector, lineItem.onLineRemoved);
        $(document).on('change', lineQuantitySelector, lineItem.onLineQuantityChanged)
    }
};

lineItem.init();
   



    let productSelector = '.new-buy-buttons',
        productButton = productSelector + ' .new-button'
        printSelector = productSelector + ' .print',
        frameSelector = productSelector + ' .framed',
        printId = $(printSelector).data('prod'),
        frameId= $(frameSelector).data('prod'),
        atcForm = '.add-to-cart-form',
        printForm = '#add-to-cart-form-' + printId,
        frameForm = '#add-to-cart-form-' + frameId,
        current = $(productSelector).data('current'),
        currentClass = '.' + current,
        currentButton = $(productButton).hasClass(current);

        
        $(atcForm+currentClass).show();
        $(atcForm).not(currentClass).hide()

        $(productButton + '.' + current).addClass('selected');



    

    $(productButton).on('click', function(event) {
        event.preventDefault()
            
        var thisId = $(this).data('prod');
        var idClass = '.' + thisId
        var match = $(atcForm).hasClass(thisId);
        

        $(productButton).toggleClass('selected')
        

        if (match) {
            console.log(atcForm+idClass)
            $(atcForm+idClass).show();
            $(atcForm).not(idClass).hide()
        }
            
    })

































    var collectionGrid = '#shopify-section-collection-template .scroll-container';
    var collectionGridInner = collectionGrid + ' .scroll-container-inner';
    var gridProduct = collectionGridInner + ' .product';
    var isCollection = $('body').hasClass('template-collection');
    let 
        pagNext = '.custom-next a',
        pagHide = '.pag-hide',
        pagStatus = '.page-load-status';
    

    // Collection Check, Infinite Scroll

    if (isCollection) {
        // console.log('is a collection')

        $(collectionGridInner).infiniteScroll({
            // options
            path: pagNext,
            append: gridProduct,
            // hideNav: pagHide,
            scrollThreshold: 600,
            status: pagStatus
        });
    
        $(collectionGridInner).on( 'request.infiniteScroll', function() {
            $(pagHide).addClass('visually-hidden')
            console.log('threshold')
        });

        $(collectionGridInner).on( 'load.infiniteScroll', function( event, body, path, response ) {
            console.log('Loaded: ' +  path);
          });
          
    
        $(collectionGridInner).on( 'append.infiniteScroll', function (items, path, response) {
            console.log('append ' + response)
        }); 

        $(collectionGridInner).on( 'error.infiniteScroll', function( event, error, path, response ) {
            console.error(`Could not load: ${path}. ${error}`);
        })
    } else {
        // console.log('not a collection')
    }

    // var optionSelector = 'select#print-selector';
    // var optionSelectorOption = optionSelector + ' option';

    // $(optionSelectorOption).each(function() {
    //     if($(this).is(':selected')) {
    //         $(this).addClass('selected-print')
    //     }
    // })

    // $(optionSelector).on('change', function () {
    //     $(optionSelectorOption).each(function() {
    //         if($(this).is(':selected')) {
    //             $(this).addClass('selected-print')
    //         } else {
    //             $(this).removeClass('selected-print')
    //         }
    //     })
    // })

    // Collection Check, Fix Header and Filters
       
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


    let mainNav = '.js-nav',
        wishlistLink = '.wishlist-link-li', 
        subMenu = '.sub-menu',
        subMenuWrap = subMenu + ' .child-wrap',
        subMenuInner = $(subMenu + ' .sub-menu-inner'),
        mainNavWidth = $(mainNav).width();



        // $(wishlistLink).ready(function() {
        //     console.log('wishlist link loaded')

        //     // subMenuInner.width(mainNavWidth);

        //     console.log('resize to' + mainNavWidth)
        // })


        let 
        collHeader = 'section.collection-header .coll-header-wrapper'
        $link = $(mainNav + ' li a')
        $mainNavlink = $(mainNav + ' li a.has-child'),
        childList = subMenuWrap;

        // $(window).resize(function () {

        //     if ($(wishlistLink).ready()) {
        //         subMenuInner.width(mainNavWidth); 
        //         console.log('resize to' + mainNavWidth)
        //     }
        // })
  
    
    // Dropdown Navigation

    $link.hover(function () {
        // console.log('resize to' + mainNavWidth)

        // if ($(wishlistLink).ready()) {
        //     // subMenuInner.width(mainNavWidth); 
        //     console.log('resize to' + mainNavWidth)
        // }

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


    // Sub Nav Filter
    
    $mainNavlink.hover(function(event) {

        event.preventDefault();


        var filter = $(this).data('filter')
        var filterClass = '.' + filter;

        // console.log(filter)

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




    // Newsletter Modal


    let modal = '#modal',
        modalClose = modal + ' .close',
        modalTiming = $(modal).data('timing'),
        modalSubmit = modal + ' form'
        // console.log('timing is ' + modalTiming);

    if (sessionStorage.hasOwnProperty("modalHide")) {
        console.log('modal previously hidden');
    } else {

        setTimeout(function(){ 
            // console.log('this took ' + modalTiming);
            $(modal).fadeIn();
        }, modalTiming);
    
        $(modalClose).on('click', function(event) {

            event.preventDefault();
            
            $(modal).fadeOut();
    
            window.sessionStorage.setItem("modalHide", "true");
            window.sessionStorage.setItem("origin", "https://roomfifty.com/");
    
            console.log(sessionStorage);
        })

        $(modalSubmit).on('submit', function() {
            
            window.sessionStorage.setItem("modalHide", "true");
            window.sessionStorage.setItem("origin", "https://roomfifty.com/");
    
        })
    
    
    }
  
    document.addEventListener("shopify:section:load", function(event) {
        if (event.detail.sectionId === "modal") {
            $(modal).fadeIn();
        }
      });

    
});