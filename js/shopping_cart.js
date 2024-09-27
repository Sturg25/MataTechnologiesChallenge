$(() => {
  let USER_CART = [];
  const RECENT_ITEMS = [
    {
      id: 1,
      name: `Festive Looks Rust Red Ribbed Velvet Long Sleeve Bodysuit`,
      price: 38,
      img: `recent1.png`,
    },
    {
      id: 2,
      name: `Chevron Flap Crossbody cart`,
      price: 5.77,
      img: `recent2.png`,
    },
    {
      id: 3,
      name: `Manilla Tan Multi Plaid Oversized Fringe Scarf`,
      price: 29,
      img: `recent3.png`,
    },
    {
      id: 4,
      name: `Diamante Puff Sleeve Dress - Black`,
      price: 45.99,
      img: `recent4.png`,
    },
    {
      id: 5,
      name: `Banneth Open Front Formal Dress In Black`,
      price: 69,
      img: `recent5.png`,
    },
  ];

  // Get item details by ID
  const get_item_details = async (id) => {
    const item_details = RECENT_ITEMS.filter((item) => item.id && item.id == id);
    return item_details;
  };

  // Initialize items in localStorage
  const init_items = () => {
    localStorage.setItem('inventory', JSON.stringify(RECENT_ITEMS));
  };

  // Show alert using SweetAlert
  const show_alert = async (msg) => {
    await Swal.fire({
      icon: 'success',
      text: msg,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Get and display shopping cart items
  const get_shopcart_items = () => {
    let itemCount = USER_CART.length;
    $('#cart_label').html(`MY CART (${itemCount})`);
    const cart_items = localStorage.getItem('cart_items');

    let contents = `<div class="row align-items-start p-2">
                      <div class="col-12">
                        <span>Your shopping cart is empty.</span>
                      </div>
                    </div>`;

    if (cart_items) {
      USER_CART = JSON.parse(cart_items);
      $('#shopcart_items').html('');
      
      if (USER_CART.length > 0) {
        contents = '';
        $('#shopcart_badge').html(USER_CART.length).removeClass('d-none');
        $('#checkout_button').removeClass('mx-3').addClass('ms-3');
        $('.checkout').removeClass('disabled');

        // Map through the items in the cart
        USER_CART.map((item) => {
          contents += `<div class="row align-items-start border-bottom p-2">
                          <div class="col-2">
                            <img src="./assets/images/${item.img}" class="items-cart" />
                          </div>
                          <div class="col d-flex flex-column align-items-start">
                            <span class="mb-3">${item.name}</span>
                            <div class="d-flex align-items-center">
                              <span class="me-2">Qty:</span>
                              <input data-item_id="${item.id}" type="number" class="form-control form-control-sm qty-input w-50 text-center cart_item" step="1" min="0" value="${item.qty}" />
                              <span data-item_id="${item.id}" class="remove_item ms-3">Remove</span>
                            </div>
                          </div>
                          <div class="col-3 d-flex justify-content-end">
                            <span><b>$ ${item.total_price}</b></span>
                          </div>
                      </div>`;
        });
      } else {
        // If the cart is empty
        $('#shopcart_badge').html('').addClass('d-none');
        $('#checkout_button').addClass('mx-3').removeClass('ms-3');
        $('.checkout').addClass('disabled');
      }

      $('#shopcart_items').html(contents);

      // Calculate subtotal and grand total
      let subTotal = USER_CART.reduce((sum, item) => sum + item.total_price, 0);
      let grandTotal = subTotal;
      $('#grandTotal').html(`$ ${grandTotal.toFixed(2)}`);

      // Update item quantity and price on change
      $('.cart_item').on('change', async function () {
        let item_id = $(this).attr('data-item_id');
        let new_qty = $(this).val();
        const index = USER_CART.map((item) => item.id).indexOf(item_id);

        if (new_qty <= 0) {
          let resp = await Swal.fire({
            text: 'Remove this item from your cart?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'Cancel',
          });

          if (resp.isConfirmed) {
            USER_CART.splice(index, 1);
            localStorage.setItem('cart_items', JSON.stringify(USER_CART));
            get_shopcart_items();
            show_alert('Cart item removed.');
            return false;
          }
        }

        const item_details = await get_item_details(item_id);
        let item_price = item_details[0].price;

        USER_CART[index].qty = new_qty;
        USER_CART[index].total_price = item_price * new_qty;
        localStorage.setItem('cart_items', JSON.stringify(USER_CART));
        get_shopcart_items();
      });

      // Remove item from cart
      $(document).on('click', '.remove_item', async function () {
        let item_id = $(this).attr('data-item_id');
        const index = USER_CART.map((item) => item.id).indexOf(item_id);

        let resp = await Swal.fire({
          text: 'Remove this item from your cart?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, remove it!',
          customClass: {
            confirmButton: 'swal-confirm-button',
          },
          cancelButtonText: 'Cancel',
        });

        if (resp.isConfirmed) {
          USER_CART.splice(index, 1);
          localStorage.setItem('cart_items', JSON.stringify(USER_CART));
          get_shopcart_items();
        }
      });
    } else {
      // If no items in localStorage
      $('#shopcart_items').html(contents);
      $('.checkout').addClass('disabled');
    }
  };

  // Add item to shopping cart
  const add_to_cart = async (id) => {
    const item_details = await get_item_details(id);
    let item_price = item_details[0].price;
    let item_name = item_details[0].name;
    let item_image = item_details[0].img;

    const existing_item = USER_CART.filter((item) => item.id && item.id == id);

    if (existing_item.length > 0) {
      const index = USER_CART.map((item) => item.id).indexOf(id);
      USER_CART[index].qty += 1;
      USER_CART[index].total_price += item_price;
      localStorage.setItem('cart_items', JSON.stringify(USER_CART));
      get_shopcart_items();
      show_alert('Item added to cart!');
    } else {
      let newItem = {
        id: id,
        name: item_name,
        img: item_image,
        qty: 1,
        total_price: item_price,
      };
      USER_CART.push(newItem);
      localStorage.setItem('cart_items', JSON.stringify(USER_CART));
      get_shopcart_items();
      show_alert('Item added to cart!');
    }
  };

  // Checkout process
  const check_out_items = async () => {
    await Swal.fire({
      icon: 'success',
      text: 'Thank you for your purchase!',
      confirmButtonText: 'Close',
    });

    localStorage.removeItem('cart_items');
    window.location.replace('index.html');
  };

  // Event handlers
  $('.inventory_item').on('click', function () {
    add_to_cart($(this).attr('data-item_id'));
  });

  $('.view_cart').on('click', function () {
    get_shopcart_items();
    $('#shop_cart').modal('show');
  });

  $('#check_out_button').on('click', function () {
    check_out_items();
  });

  $('.logo').on('click', function () {
    window.location.replace('index.html');
  });

  // Show panel on click
  $('#checkout_button').on('click', function () {
    $('#cart_panel').removeClass('d-none').addClass('show');
    get_shopcart_items();

    const buttonOffset = $(this).offset();
    $('#cart_panel').css({
      top: buttonOffset.top + $(this).outerHeight(),
      left: buttonOffset.left,
    });
  });

  // Close panel when clicking the X button
  $('#closecart_panel').on('click', function () {
    $('#cart_panel').removeClass('show');
    setTimeout(() => {
      $('#cart_panel').addClass('d-none');
    }, 200);
  });

  // Hide panel if clicking outside
  $(document).on('click', function (event) {
    if (!$(event.target).closest('#checkout_button, #cart_panel').length) {
      $('#cart_panel').removeClass('show');
      setTimeout(() => {
        $('#cart_panel').addClass('d-none');
      }, 200);
    }
  });

  // Initialize and fetch cart items
  init_items();
  get_shopcart_items();
});
