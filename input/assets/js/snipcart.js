(function() {
    const button = document.querySelector('#addToCartButton'),
        quantity = document.querySelector('#productQuantity'),
        sizes = document.querySelectorAll('[name="productSize"]');

    // Get and set quantity
    if (quantity) {
        setQuantity();

        quantity.addEventListener('change', function () {
            setQuantity();
        });

        function setQuantity() {
            button.setAttribute('data-item-quantity', quantity.value)
        }
    }

    // Get and set size
    if (sizes) {
        sizes.forEach(function (size) {
            if (size.checked == true) {
                setSize(size);
            }

            size.addEventListener('change', function () {
                setSize(size);
            });
        });

        function setSize(size) {
            button.setAttribute('data-item-custom1-value', size.value)
        }
    }
})();

// Snipcart API
document.addEventListener('snipcart.ready', () => {
    // Customize payment area
    Snipcart.api.theme.customization.registerPaymentFormCustomization({
        input: {
            backgroundColor: '#e3e3e3',
            color: '#121212',
            border: '1px solid #121212',
            fontSize: '14px',
            placeholder: {
                color: '#121212',
            },
        },
        label: {
            color: '#121212',
            fontSize: '14px',
        }
    })
});