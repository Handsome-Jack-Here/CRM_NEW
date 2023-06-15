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

    async function getOrderList(search = '', elem_per_page = '&page_size=10', current_page = 'page=1') {

        releaseActions();
        $('#order_list').hide();

        // search filter
        $('.form-control-dark').off().on('input', function (e) {
            e.preventDefault()
            search = $('.form-control-dark').val();
            if (search) {
                search = `search=` + `${search}`;
            }

            getOrderList(search);
        });
        if (search) {
            current_page = '';
        }


        $('#pagination_bar a').off().click(function () {
            resetPagination()
            $(this).css('background-color', '#e3f6f5');
            getOrderList(search = '', elem_per_page = '&page_size=' + $(this).text());
        });


        async function clear() {
            $('#order_list tbody *').remove();
        }

        clear().then(function () {
            listCreate();
        });

        async function listCreate() {
            const response = await fetch(`/api/v1/orders/?` + current_page + search + elem_per_page);
            let orders = await response.json();
            for (let order of orders['results']) {
                let client_image = order.client_image.split(' ')
                $('#order_list tbody').append(`<tr><td><a href="" style="text-decoration: none" ">${order.order_id}</a></td><td>${client_image[0]} ${client_image[1]} </td><td>${order.unit_image}</td><td>${order.defect}</td><td>Stage none</td></tr>`)
            }
            let item = $('#order_list, #order_list *');
            hideAndShow(item);
        }
    }


    async function getOrderDetail(order_id) {

        holdActions();
        newSpFormClean();
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


        async function getOrder() {
            let order_detail = await fetch(`/api/v1/orders/${order_id}/`);
            let order = await order_detail.json();
            return order;

        }

        function newSpFormClean() {
            $('#new_sp_description').val('');
            $('#new_sp_price').val('');
            $('#new_sp_warranty option:first').prop('selected', true);
        }

        async function createSPTable() {
            let order = await getOrder();
            $('#sp_id_header').hide()

            let snp_table = $('#snp');
            snp_table.hide();
            $('#snp tbody *').each(function () {
                $(this).remove();
            })

            for (let num of order.sp) {
                let resp = await fetch(`/api/v1/services-and-parst/${num}/`);
                let sp = await resp.json();

                $('#snp tbody').append(
                    `<tr>
                            <td hidden id="sp_id">${sp.id}</td>
                            <td id="sp_description">${sp.name}</td>
                            <td id="sp_price">${sp.price}</td>
                            <td id="sp_warranty">${sp.warranty}</td>
                            <td><a style="text-decoration: none" href="">Delete</a></td>
                    </tr>`)
            }
            snp_table.fadeIn(140);


            $('#add_sp').off().on('click', async function() {

                await addSP();
            });

            $('#snp tr').off().on('click', async function (e) {
                e.preventDefault();
                let remove_item = $(this).find('#sp_id').text();
                $('#new_sp_description').val($(this).find('#sp_description').text());
                $('#new_sp_price').val($(this).find('#sp_price').text());
                let a = $(this).find('#sp_warranty').text();
                $(`#new_sp_warranty option:contains(${a})`).prop('selected', true);
                let sp_button = $('#add_sp');
                sp_button.text('Change');

                sp_button.off().on('click', async function (){
                    alert('change');
                    await addSP(remove_item);
                });


                // await addSP(remove_item);
            })
        }

        await createSPTable();

        async function addSP(remove_item = null) {
            let order = await getOrder();

            let matrix = [];
            for (let sp of order.sp) {
                matrix.push(sp);
            }

            if (remove_item) {
                let index = matrix.indexOf(remove_item);
                delete matrix[index];
            }

            let new_sp = {
                'name': $('#new_sp_description').val(),
                'price': $('#new_sp_price').val(),
                'warranty': $('#new_sp_warranty').find(":selected").text(),
            }

            let options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(new_sp)
            }


            let resp = await fetch(`/api/v1/services-and-parst/`, options);
            let sp = await resp.json();
            matrix.push(sp.id);


            let sp_list = {'sp': matrix};
            options.body = JSON.stringify(sp_list);
            options.method = 'PATCH';

            let response = await fetch(`/api/v1/orders/${order_id}/`, options);
            if (response.status === 200) {
                $('#add_sp').text('Create');
                newSpFormClean();
            } else {
                alert(response.status);
            }
            await createSPTable();
        }



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


    async function getPaymentList() {

        let item = $('#payments_page ,#payments_page *');
        hideAndShow(item);

        function clear() {
            $('#payments_list tbody *').remove();
            $('#payments_list_summary span *').remove();
        }

        clear();

        holdActions();
        const response = await fetch(`/api/v1/payments/`);
        let payments = await response.json();
        let summary = 0
        let color = ''
        let sign = ''
        for (let payment of payments) {
            if (payment.payment_type === true) {
                summary += payment.payment_value;
                color = '#3f9565';
                sign = ' +';

            } else {
                summary -= payment.payment_value;
                color = '#cd6c7a';
                sign = ' -';
            }

            $('#payments_list tbody')
                .append(`<tr><td style="background: ${color}">${sign}${payment.payment_value}</td>
                <td>${payment.created.slice(0, 10)} ${payment.created.slice(11, 16)}</td>
                <td>${payment.order_preview}</td><td>${payment.money_total}</td></tr>`);
        }
        $('#current_summary').append(`<span>${summary}</span>`);
    }

    async function newPaymentSave(order = NaN, type = true) {


        let payment_fields = {
            'payment_detail': $('#payment_comment').val(),
            'payment_value': $('#payment_value').val(),
            'currency': '1',
            'order': order,
            'payment_type': type

        }

        let options = {

            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(payment_fields)
        }
        try {
            const response = await fetch(`/api/v1/payments/`, options)
            const data = await response.json()
            $('#new_payment_form').each(function () {
                this.reset();
            })
            let item = $('#payments_page ,#payments_page *');
            hideAndShow(item);

            getPaymentList();

        } catch (error) {
            $('#payment_value_error').append(`<p>The expense cannot exceed the amount in cashbox</p>`);
        }
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
        holdActions();
        let item = $('#new_order, #new_order *');
        hideAndShow(item);
    });


    $('#payments a').click(function () {
        getPaymentList();
    });

    $('#orders_list_link a').on('click', function () {
        let item = $('#order_list, #order_list *');
        hideAndShow(item);
        resetPagination();
        getOrderList();

    });


    $('#add').off().on('click', function () {
        let item = $('#add_payment_page, #add_payment_page *');
        hideAndShow(item);
        $('#payment_value_error p').remove()

        $('#payment_discard').off().on('click', function () {
            getPaymentList();
        });

        $('#payment_save').off().on('click', function () {
            validator();
            if ($('#new_payment_form').valid()) {
                newPaymentSave(NaN, true);
            }
        });
    });

    $('#expense').off().on('click', function () {
        let item = $('#add_payment_page, #add_payment_page *');
        hideAndShow(item);
        $('#payment_value_error p').remove()

        $('#payment_discard').off().on('click', function () {
            getPaymentList();
        });

        $('#payment_save').off().on('click', function () {
            validator();
            if ($('#new_payment_form').valid()) {
                newPaymentSave(NaN, false);
            }
        });
    })


    function holdActions() {
        $('.static_content').fadeTo(200, 0.9).css('pointer-events', 'none');
    }

    function releaseActions() {
        $('.static_content').css('pointer-events', 'auto').fadeTo(200, 1);
    }

    function resetPagination() {
        $('#pagination_bar a').each(function () {
            $(this).css('background-color', 'white')
        });
    }

    // validation
    $('#create_order').on('click', function () {
        validator();
        if ($('#new_order_form').valid()) {
            newOrderSave();
        }
    });

    function hideAndShow(item = NaN) {

        $('.right_side div *').prop('hidden', true).hide();
        $('.right_side').prop('hidden', false).show(140);
        item.prop('hidden', false).fadeIn(140);
    }

    getOrderList().then(function () {
        $('#order_list').fadeIn(140);
    });
});


