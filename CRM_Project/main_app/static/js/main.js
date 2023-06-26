import {validator} from "./validations.js";
import {getCookie} from "./get_CSRF.js";

$(document).ready(function () {

    const csrftoken = getCookie('csrftoken');


    async function newOrderSave() {
        $('#new_order_page').attr('hidden', true);


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
            resetNewOrder();
            getOrderList();
        } else {
            alert(response.status)
            $('#new_order_page').removeAttr('hidden');
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
            resetPagination();
            $(this).css('background-color', '#e3f6f5');
            getOrderList(search = '', elem_per_page = '&page_size=' + $(this).text());
        });


        await clear().then(function () {
            listCreate();
        });

        async function clear() {
            $('#order_list_page tbody *').remove();
        }


        async function listCreate() {
            const response = await fetch(`/api/v1/orders/?` + current_page + search + elem_per_page);
            let orders = await response.json();
            for (let order of orders['results']) {
                let client_image = order.client_image.split(' ')
                $('#order_list_page tbody').append(
                    `<tr>
                        <td><a href="" style="text-decoration: none" ">${order.order_id}</a></td>
                        <td>${client_image[0]} ${client_image[1]}</td>
                        <td>${client_image[2]}${client_image[3]}${client_image[4]}</td>
                        <td>${order.unit_image}</td>
                        <td>${order.defect}</td>
                        <td>Stage none</td>
                    </tr>`)
            }
            let item = $('#order_list_page');
            hideAndShow(item);
            releaseActions();
        }
    }


    async function getOrderDetail(order_id) {

        holdActions();
        await newSpFormShow();
        $('#order_list_page').hide();

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

        async function newSpFormShow() {
            $('#edit_sp_form').prop('hidden', true);
            $('#new_sp_form').prop('hidden', false);

            $('#new_sp_description').val('');
            $('#new_sp_price').val('');
            $('#new_sp_warranty option:first').prop('selected', true);
        }

        async function editSpFormShow() {
            $('#edit_sp_form').prop('hidden', false);
            $('#new_sp_form').prop('hidden', true);

            $('#edit_sp_description').val('');
            $('#edit_sp_price').val('');
            $('#edit_sp_warranty option:first').prop('selected', true);
        }

        async function createSPTable() {

            let snp_table = $('#snp');
            snp_table.hide();
            $('#sp_id_header').hide()

            $('#edit_sp_form').prop('hidden', true);

            let order = await getOrder();

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
                            <td><a hidden id="delete" style="text-decoration: none;" href="">Delete</a></td>
                    </tr>`)
            }
            snp_table.fadeIn(140);


            $('#add_sp_button').off().on('click', async function () {
                let new_sp = {
                    'name': $('#new_sp_description').val(),
                    'price': $('#new_sp_price').val(),
                    'warranty': $('#new_sp_warranty').find(":selected").text(),

                }
                validator();
                if ($('#nf').valid()) {

                    await addSP(null, new_sp);
                } else {
                }
            });

            let table_item = $('#snp tr');

            table_item.off().on('click', async function (e) {
                e.preventDefault();
                await editSpFormShow();

                $('.sp_table_elem *').each(function () {
                    let all_delete_items = $(this).find('#delete');
                    all_delete_items.prop('hidden', true);
                });


                let del = $(this).find('#delete');
                del.prop('hidden', false);

                let remove_item = $(this).find('#sp_id').text();
                $('#edit_sp_description').val($(this).find('#sp_description').text());
                $('#edit_sp_price').val($(this).find('#sp_price').text());
                let warranty = $(this).find('#sp_warranty').text();
                $(`#edit_sp_warranty option:contains(${warranty})`).prop('selected', true);


                $('#save_edit_sp_button').off().on('click', async function () {
                    validator();

                    let new_sp = {
                        'name': $('#edit_sp_description').val(),
                        'price': $('#edit_sp_price').val(),
                        'warranty': $('#edit_sp_warranty').find(":selected").text(),

                    }

                    await addSP(remove_item, new_sp);
                });

                $('#cancel_edit_sp_button').off().on('click', async function () {
                    await newSpFormShow();
                })

                $('.sp_table_elem a').off().on('click', async function () {
                    await addSP(remove_item);
                })
            })
            await newSpFormShow();
        }

        await createSPTable();

        async function addSP(remove_item = null, new_sp) {
            let order = await getOrder();

            let matrix = [];
            for (let sp of order.sp) {
                matrix.push(sp);
            }

            if (remove_item) {
                remove_item = parseInt(remove_item);
                let index = matrix.indexOf(remove_item);
                matrix.splice(index, 1);

            }

            let options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(new_sp)
            }

            if (new_sp) {
                let resp = await fetch(`/api/v1/services-and-parst/`, options);
                let sp = await resp.json();
                matrix.push(sp.id);
            }

            let sp_list = {'sp': matrix};
            options.body = JSON.stringify(sp_list);
            options.method = 'PATCH';

            let response = await fetch(`/api/v1/orders/${order_id}/`, options);
            if (response.status === 200) {

                await createSPTable();
            } else {

                alert(response.status);
                await createSPTable();
            }
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
                    let item = $('#order_detail');
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

        let item = $('#payments_page');
        hideAndShow(item);

        // holdActions();

        function clear() {
            $('#payments_list tbody *').remove();
            $('#payments_list_summary span *').remove();
        }

        clear();


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
            let item = $('#payments_page');
            hideAndShow(item);

            getPaymentList();

        } catch (error) {
            $('#payment_value_error').append(`<p>The expense cannot exceed the amount in cashbox</p>`);
        }
    }


    $('#orders').on('click', 'a', function (e) {

        e.preventDefault();
        let order_id = $(this).text();
        let item = $('#order_detail');

        hideAndShow(item);
        getOrderDetail(order_id).then(function () {
        });
    });


    $('#new_order_button').off().on('click', function () {

        $('#add_new_type').click(function () {
            showNewType().then();
        });

        $('#new_type_discard').on('click', function () {
            showTypes().then();
        });

        $('#new_type_save').on('click', async function () {
            let new_type_name = {
                'name': $('#new_type_name').val(),
            }

            let options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(new_type_name)
            }

            let response = await fetch('/api/v1/unit-types/', options);
            let data = await response.json();
            if (response.status === 201) {
                await showSelectField('/api/v1/unit-types/', `#unit_type select`, JSON.stringify(data.name));
            } else {
                alert(response.status);
            }

        });


        showSelectField('/api/v1/unit-types/', `#unit_type select`, false).then();

        let item = $('#new_order_page');
        hideAndShow(item);
        holdActions();


    });

    $('#discard_new_order').off().on('click', function () {
        resetNewOrder();
        getOrderList().then();
    })


    $('#payments a').click(function () {
        getPaymentList().then();
    });

    $('#orders_list_link a').on('click', function () {
        let item = $('#order_list_page');
        hideAndShow(item);
        resetPagination();
        getOrderList().then();

    });


    $('#add').off().on('click', function () {
        let item = $('#add_payment_page');
        hideAndShow(item);
        $('#payment_value_error p').remove()

        $('#payment_discard').off().on('click', function () {
            getPaymentList().then();
        });

        $('#payment_save').off().on('click', function () {
            validator();
            if ($('#new_payment_form').valid()) {
                newPaymentSave(NaN, true).then();
            }
        });
    });

    $('#expense').off().on('click', function () {
        let item = $('#add_payment_page');
        hideAndShow(item);
        $('#payment_value_error p').remove()

        $('#payment_discard').off().on('click', function () {
            getPaymentList().then();
        });

        $('#payment_save').off().on('click', function () {
            validator();
            if ($('#new_payment_form').valid()) {
                newPaymentSave(NaN, false).then();
            }
        });
    })


    async function showSelectField(url, fieldSelector = null, selectedItemName = null) {

        let toRemove = fieldSelector + ' *'
        $(toRemove).each(function () {
            $(this).remove();
        });
        $(fieldSelector).append(`<option>Select unit type</option>`);


        let response = await fetch(url);
        let data = await response.json();

        for (let item of data) {
            $(fieldSelector).append(`<option>${item.name}</option>`);
        }

        if (selectedItemName) {
            $('#unit_type option').each(function () {
                if (JSON.stringify($(this).text()) === selectedItemName) {
                    $(this).attr('selected', 'selected');
                    return false;
                }
            });
        }
        showTypes().then();
    }

    async function showNewType() {
        $('#new_type_name').val('');
        $('#new_order_unit_group').prop('hidden', true);
        $('#create_new_unit_type').prop('hidden', false);
    }

    async function showTypes(new_item = null) {
        $('#new_type_name').val('');
        $('#new_order_unit_group').prop('hidden', false);
        $('#create_new_unit_type').prop('hidden', true);
    }

    function holdActions() {
        $('.static_content').fadeTo(100, 0.9).css('pointer-events', 'none');
    }

    function releaseActions() {
        $('.static_content').css('pointer-events', 'auto').fadeTo(100, 1);
    }

    function resetPagination() {
        $('#pagination_bar a').each(function () {
            $(this).css('background-color', 'white');
        });
    }

    function resetNewOrder() {
        $('#new_order_form').each(function () {
            this.reset();
        })
    }

// validation
    $('#create_order').on('click', function () {
        validator();
        if ($('#new_order_form').valid()) {
            newOrderSave();
        }
    });

    function hideAndShow(item = NaN) {

        $('.dynamic_content').prop('hidden', true).hide();
        item.prop('hidden', false).fadeIn(140);

    }

    getOrderList().then();

})
;


