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

                return selectedVariant;

                console.log(variants);
                console.log(formData);
                console.log(formOptions);
            },
            validate: function(event, selectedVariant) {
                console.log('form validate');
                console.log(selectedVariant);

                let
                    $form = $(this).closest(addToCartFormSelector),
                    hasVariant = selectedVariant !== null,
                    canAddToCart = hasVariant && selectedVariant.inventory_quantity > 0,
                    $id = $form.find('.js-variant-id'),
                    $qty = $form.find('.js-variant-qty'),
                    $addToCartButton = $form.find('.add-to-cart-button'),
                    $price = $form.find('.js-price'),
                    formattedVariantPrice = null,
                    priceHtml = null,
                    addMsg = '.add-to-cart-button .add-msg',
                    wholeButton = '.add-to-cart-button h3.sub',
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
                        $qty.val(selectedVariant.inventory_quantity);
                        $(localButton).prop('disabled', false);
                        $addToCartButton.removeClass('unavailable');
                      
                        $(localAddMsg).html('Add to Bag')
                        $(localPriceWrap).removeClass('visually-hidden')
                       
                        
                        
                    } else if (!canAddToCart) {

                        console.log('disabled')

                        $id.val('');
                        $(localButton).prop('disabled', true);
                        $qty.val(selectedVariant.inventory_quantity);
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



    // Quantity Fields –––––––––––––––––––––––––––––––––

    let 
    quantityFieldSelector = '.js-quantity-field',
    quantityButtonSelector = '.js-quantity-button',
    quantityPickerSelector = '.js-quantity-picker',
    quantityPicker = {
        onButtonClick: function(event) {
        // alert('button clicked');
        let
            $button = $(this),
            $picker = $button.closest(quantityPickerSelector),
            $quantity = $picker.find('.js-quantity-field'),
            quantityValue = parseInt($quantity.val()),
            max = $quantity.attr('max') ? parseInt($quantity.attr('max')) : null;
    
        if ($button.hasClass('plus') && (max === null || quantityValue+1 <= max)) {
            // do something for plus click
            $quantity.val(quantityValue + 1).change();
        }
        else if ($button.hasClass('minus')) {
            // do something for minus click
            $quantity.val(quantityValue - 1).change();
        }
        },
        onChange: function(event) {
        let
            $field = $(this),
            $picker = $field.closest(quantityPickerSelector),
            $quantityText = $picker.find('.js-quantity-text'),
            shouldDisableMinus = parseInt(this.value) === parseInt($field.attr('min')),
            shouldDisablePlus = parseInt(this.value) === parseInt($field.attr('max')),
            $minusButton = $picker.find('.js-quantity-button.minus'),
            $plusButton = $picker.find('.js-quantity-button.plus');
    
        $quantityText.text(this.value);
    
        if (shouldDisableMinus) {
            $minusButton.prop('disabled', true);
      
        }
        else if ($minusButton.prop('disabled') === true) {
            $minusButton.prop('disabled', false);
            
        }
    
        if (shouldDisablePlus) {
            $plusButton.prop('disabled', true);
            $plusButton.addClass('disabled'); 
        }
        else if ($plusButton.prop('disabled') === true) {
            $plusButton.prop('disabled', false);
            $plusButton.addClass('disabled');
        }
        },
        init: function() {
        $(document).on('click', quantityButtonSelector, quantityPicker.onButtonClick);
        $(document).on('change', quantityFieldSelector, quantityPicker.onChange);
    
        }
    };

    quantityPicker.init();


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

});