import {validator} from "./validations.js";
import {getCookie} from "./get_CSRF.js";

$(document).ready(function () {

    const csrftoken = getCookie('csrftoken');


    async function newOrderSave() {
        $('#new_order').attr('hidden', true);


        // client
        let client_fields = {
            'first_name': $('#new_order_form #first_name').val(),
            'last_name': $('#new_order_form #last_name').val(),
            'phone': $('#new_order_form #phone_number').val(),
            'address': $('#new_order_form #address').val(),

        }
        let options = {

            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(client_fields)
        }

        const response = await fetch(`/api/v1/clients/`, options)
        let data = await response.json()
        let client_id = parseInt(JSON.stringify(data.id))
        // end client

        // brand
        let brand_fields = {
            'name': $('#new_order_form #brand').val(),
        }

        let brand_options = {

            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(brand_fields)
        }

        const brand_response = await fetch(`/api/v1/brands/`, brand_options)
        let brand_data = await brand_response.json()
        let brand_id = JSON.stringify(brand_data.id)
        // end brand

        // model
        let model_fields = {
            'name': $('#new_order_form #model').val(),
        }
        let model_options = {

            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(model_fields)
        }

        const model_response = await fetch(`/api/v1/models/`, model_options)
        let model_data = await model_response.json()
        let model_id = parseInt(JSON.stringify(model_data.id))
        // end model

        // unit
        let unit_fields = {
            'serial_number': $('#new_order_form #serial_number').val(),
            'brand': brand_id,
            'model': model_id
        }
        let unit_options = {

            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(unit_fields)
        }

        const unit_response = await fetch(`/api/v1/units/`, unit_options)
        let unit_data = await unit_response.json()
        let unit_id = parseInt(JSON.stringify(unit_data.id))
        // end unit


        let order_fields = {
            'defect': $('#new_order_form #defect').val(),
            'client': client_id,
            'unit': unit_id,
        }
        options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(order_fields)
        }

        await fetch(`/api/v1/orders/`, options)


        if (response.status === 201) {
            $('#new_order_form').each(function () {
                this.reset()
                getOrderList().then($('#order_list').fadeIn(200));
            })

            $('#order_list').prop('hidden', false);
            $('#order_list *').prop('hidden', false);


        } else {
            alert(response.status)
            $('#new_order').removeAttr('hidden');
        }
    }

    async function saveOrder(order_num, client_num, unit_num) {
        $('#order_detail').attr('hidden', true);

        let order = {
            'defect': $('#defect').val(),
            'diagnostic_result': $('#diagnostic_result').val(),
            'required_works': $('#required_works').val(),

            'first_name': $('#first_name').val(),
            'last_name': $('#last_name').val(),
            'phone': $('#phone_number').val(),

            'serial_number': $('#serial_number').val(),

        }
        let options = {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(order)
        }


        await fetch(`/api/v1/clients/${client_num}/`, options)
            .then(async function () { // model save
                order["name"] = $('#model').val();
                options.body = JSON.stringify(order);
                options.method = 'POST';

                const model_response = await fetch(`/api/v1/models/`, options);
                const model_data = await model_response.json();

                order['model'] = model_data.id;
                options.body = JSON.stringify(order);
                options.method = 'PATCH';

                await fetch(`/api/v1/units/${unit_num}/`, options);
            })
            .then(async function () { // brand save
                order["name"] = $('#brand').val();
                options.body = JSON.stringify(order);
                options.method = 'POST';

                const brand_response = await fetch(`/api/v1/brands/`, options);
                const brand_data = await brand_response.json();

                order['brand'] = brand_data.id;
                options.body = JSON.stringify(order);
                options.method = 'PATCH';

                await fetch(`/api/v1/units/${unit_num}/`, options);
            })
            .then(async function () { // order save
                options.method = 'PATCH'
                await fetch(`/api/v1/orders/${order_num}/`, options)
            })
    }

    async function getOrderList(search = '', elem_per_page = 16) {
        $('.static_content').css('pointer-events', 'auto').fadeTo(200, 1);
        $('#order_list').hide();

        // search filter
        $('.form-control-dark').off().on('input', function (e) {
            e.preventDefault()
            search = $('.form-control-dark').val()
            if (search) {
                search = `search=` + `${search}`
            }

            getOrderList(search)
        })

        let current_page = 1

        $('#pagination_bar li').off().click(function () {
            getOrderList(search = '', elem_per_page = $(this).text());
        })

        let page = `page=${current_page}`
        if (search) {
            page = ''
        }


        async function clear() {
            $('#order_list tbody *').remove()
        }

        clear().then(function () {
            listCreate()
        });

        async function listCreate() {
            const response = await fetch(`/api/v1/orders/?` + page + search + '&page_size=' + elem_per_page);
            let orders = await response.json()
            for (let order of orders['results']) {
                let client_image = order.client_image.split(' ')
                $('#order_list tbody').append(`<tr><td><a href="" style="text-decoration: none" ">${order.order_id}</a></td><td>${client_image[0]} ${client_image[1]} </td><td>${order.unit_image}</td><td>${order.defect}</td><td>Stage none</td></tr>`)
            }
            let item = $('#order_list, #order_list *');
            hideAndShow(item);
        }
    }


    async function getOrderDetail(order_id) {

        $('.static_content').fadeTo(200, 0.9).css('pointer-events', 'none');
        $('#order_list').hide();

        const order_detail = await fetch(`/api/v1/orders/${order_id}/`);
        const order = await order_detail.json();
        const client_detail = await fetch(`/api/v1/clients/${order.client}/`);
        const client = await client_detail.json();
        const unit_detail = await fetch(`/api/v1/units/${order.unit}/`);
        const unit = await unit_detail.json();
        const brand_detail = await fetch(`/api/v1/brands/${unit.brand}/`);
        const brand = await brand_detail.json();
        const model_detail = await fetch(`/api/v1/models/${unit.model}/`);
        const model = await model_detail.json().then($('#order_detail').removeAttr('hidden'));


        $('#order_id').text('Order# ' + order_id);

        $('#defect').val(order.defect);
        $('#diagnostic_result').val(order.diagnostic_result);
        $('#required_works').val(order.required_works);

        $('#first_name').val(client.first_name);
        $('#last_name').val(client.last_name);
        $('#phone_number').val(client.phone);

        $('#brand').val(brand.name);
        $('#model').val(model.name);
        $('#serial_number').val(unit.serial_number);

        $('.text-end').hide();

        $('.time_field span').empty();
        $('#creation_date').append(order.created.slice(0, 10));
        $('#creation_time').append(order.created.slice(11, 16));
        $('#update_date').append(order.edited.slice(0, 10));
        $('#update_time').append(order.edited.slice(11, 16));


        let hash = [];

        $('#order_detail *').each(function () {
            hash += $(this).val();
        });


        $('#save').off().on('click', async function (e) {
            e.preventDefault();
            saveOrder(order_id, order.client, order.unit)
                .then(function () {
                    getOrderList();
                });
        });

        $('#discard').off().on('click', function () {
            let current = [];

            $('#order_detail *').each(function () {
                current += $(this).val();
            })

            if (hash !== current) {
                let item = $('#save_page, #save_page *');
                hideAndShow(item);

                $('#return').off().on('click', function () {
                    let item = $('#order_detail, #order_detail *');
                    hideAndShow(item);

                })

                $('#cancel').off().on('click', function () {
                    getOrderList();
                })

            } else {
                getOrderList();
            }
        })
    }


    $('#orders').on('click', 'a', function (e) {
        e.preventDefault();
        let order_id = $(this).text();
        let item = $('#order_detail, #order_detail *');

        hideAndShow(item)
        getOrderDetail(order_id = order_id).then(function () {
        })
    });


    $('#new_order_button').on('click', function () {
        $('.static_content').fadeTo(200, 0.9).css('pointer-events', 'none');
        let item = $('#new_order, #new_order *');
        hideAndShow(item);
    })


    $('#payments a').click(function () {
        let item = $('#payments_page ,#payments_page *');
        hideAndShow(item);
    })

    $('#orders_list_link a').on('click', function () {
        let item = $('#order_list, #order_list *');
        hideAndShow(item);
        getOrderList();

    })


    // validation
    $('#create_order').on('click', function () {
        validator();
        if ($('#new_order_form').valid()) {
            newOrderSave();
        }
    })

    function hideAndShow(item = NaN) {

        $('.right_side div *').prop('hidden', true).hide();
        $('.right_side').prop('hidden', false).show(140);
        item.prop('hidden', false).fadeIn(140);
    }

    getOrderList().then(function () {
        $('#order_list').fadeIn(140);
    });
});


