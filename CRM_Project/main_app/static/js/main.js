import {validator} from "./validations.js";
import {getCookie} from "./get_CSRF.js";

$(document).ready(function () {

    const csrftoken = getCookie('csrftoken');


    async function newOrderSave() {


        // client
        let client_fields = {
            'first_name': $('#new_order_first_name').val(),
            'last_name': $('#new_order_last_name').val(),
            'phone': $('#new_order_phone_number').val(),
            'address': $('#new_order_address').val(),
            'mail': $('#new_order_email').val(),
        }

        let client_options = {

            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(client_fields)
        }

        //
        const client_response = await fetch(`/api/v1/clients/`, client_options);
        let client_data = await client_response.json();
        let client_id = parseInt(JSON.stringify(client_data.id));

        // end client


        let brand_id = $('#new_order_brand').find(":selected").val();
        let unit_type_id = $('#new_order_unit_type').find(":selected").val();
        // alert(unit_type_id)


        // model

        let model_fields = {
            'name': $('#new_order_model').val(),
        }
        let model_options = {

            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(model_fields)
        }

        const model_response = await fetch(`/api/v1/models/`, model_options);
        let model_data = await model_response.json()
        let model_id = parseInt(JSON.stringify(model_data.id))


        // end model


        // unit
        let unit_fields = {
            'serial_number': $('#new_order_serial_number').val(),
            'brand': brand_id,
            'model': model_id,
            'type': unit_type_id,
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
            'defect': $('#new_order_defect').val(),
            'client': client_id,
            'unit': unit_id,
            'client_comments': $('#new_order_client_comments').val(),

        }


        let order_options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(order_fields)
        }

        let order_response = await fetch(`/api/v1/orders/`, order_options)


        if (order_response.status === 201) {
            resetNewOrder();
            await getOrderList().then();
        } else {
            alert(order_response.status)
            $('#new_order_page').removeAttr('hidden');
        }
    }

    async function saveOrder(order_num, client_num, unit_num) {
        $('#order_detail').attr('hidden', true);

        let data = {
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
            body: JSON.stringify(data)
        }


        const clientRequest = await fetch(`/api/v1/clients/${client_num}/`, options);
        const clientResponse = await clientRequest.json();
        let clientId = JSON.stringify(clientResponse.id);
        if (client_num !== clientId) {
            data['client'] = clientId;
            options.body = JSON.stringify(data);
            options.method = 'PATCH';
            await fetch(`/api/v1/orders/${order_num}/`, options);
        }

        data["name"] = $('#model').val();
        options.body = JSON.stringify(data);
        options.method = 'POST';

        const model_response = await fetch(`/api/v1/models/`, options);
        const model_data = await model_response.json();

        data['model'] = model_data.id;
        options.body = JSON.stringify(data);
        options.method = 'PATCH';

        await fetch(`/api/v1/units/${unit_num}/`, options);


        data["name"] = $('#brand').val();
        options.body = JSON.stringify(data);
        options.method = 'POST';

        const brand_response = await fetch(`/api/v1/brands/`, options);
        const brand_data = await brand_response.json();

        data['brand'] = brand_data.id;
        options.body = JSON.stringify(data);
        options.method = 'PATCH';

        await fetch(`/api/v1/units/${unit_num}/`, options);


        options.method = 'PATCH'
        await fetch(`/api/v1/orders/${order_num}/`, options)

    }


    async function getOrderList(search = '', elementsPerPage = lastPagesCount, currentPage = 'page=1') {


        let showBySelectField = $('#show_by_select')
        let showBySelectFieldOptions = $('#show_by_select option')


        // search filter
        $('.form-control-dark').off().on('input', function (e) {
            e.preventDefault()
            search = $('.form-control-dark').val();
            if (search) {
                search = `search=` + `${search}`;
            }

            getOrderList(search, lastPagesCount);
        });
        if (search) {
            currentPage = '';
        }

        // shown elements count
        showBySelectField.off().on('change', function () {
            getOrderList(search = '', $(this).val());
        });


        async function listCreate() {
            const response = await fetch(`/api/v1/orders/?` + currentPage + search + '&page_size=' + elementsPerPage);
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
                        <td>Stage</td>
                    </tr>`)
            }

            createPaginationSize(orders.count, elementsPerPage);
            let item = $('#order_list_page');
            await hideAndShow(item);
            releaseActions();
        }

        function createPaginationSize(max, current) {
            showBySelectFieldOptions.each(function () {
                $(this).remove()
            });

            showBySelectField
                .append(`<option value="${startElementsCount}">${startElementsCount}</option>`)
                .append(`<option value="20">20</option>`)
                .append(`<option value="30">30</option>`)
                .append(`<option value="40">40</option>`)
                .append(`<option value="50">50</option>`)
                .append(`<option value="${max}">All</option>`);
            showBySelectField.val(current);
            lastPagesCount = current
        }

        async function orderListClear() {
            $('#order_list_page tbody *').remove();
        }

        await orderListClear().then(async function () {
            await listCreate();
        });
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
        const unit_type_detail = await fetch(`/api/v1/unit-types/${JSON.stringify(unit.type)}`);
        const unit_type = await unit_type_detail.json();


        await createSelectField('/api/v1/unit-types/', '#order_detail_unit_type', parseInt(unit_type.id));
        await createSelectField('/api/v1/brands/', '#order_detail_brand', parseInt(brand.id));

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
                            <td><a hidden id="delete" style=" text-decoration: none;" href="">Delete</a></td>
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

        function paymentsClear() {
            $('#payments_list tbody *').remove();
            $('#payments_list_summary span *').remove();
        }

        paymentsClear();


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

    let staticContent = $('.static_content');

    let newOrderButton = $('#new_order_button');
    let newOrderDiscardButton = $('#discard_new_order');

    let getOrder = $('#orders');
    let getOrdersList = $('#orders_list_link a');

    let getPaymentsList = $('#payments a');

    let addNewSelectItemButton = $('.add_new_select_item');
    let newOrderAddNewDiscardButton = $('.add_discard');
    let newOrderAddNewSaveButton = $('.save_new_item');

    let newOrderSaveButton = $('#create_order');


    getOrder.off().on('click', 'a', async function (e) {
        e.preventDefault();
        let order_id = $(this).text();
        let item = $('#order_detail');

        await getOrderDetail(order_id);
        hideAndShow(item);
    });

    getOrder.on('dblclick', 'tr', async function (e) {
        e.preventDefault();
        let order_id = $(this).find('a').text();
        let item = $('#order_detail');

        await getOrderDetail(order_id);
        hideAndShow(item);
    })


    newOrderButton.off().on('click', async function () {

        let url = '/api/v1/unit-types/';
        let selectElementId = '#new_order_unit_type';
        createSelectField(url, selectElementId).then();

        url = '/api/v1/brands/';
        selectElementId = '#new_order_brand';
        createSelectField(url, selectElementId).then();

        await createConditionsField('#new_order_conditions_field', '/api/v1/unit-conditions/').then();

        let item = $('#new_order_page');
        hideAndShow(item);
        holdActions();
    });


    newOrderDiscardButton.off().on('click', function () {
        resetNewOrder();
        getOrderList().then();
    });


    getPaymentsList.click(async function () {
        let item = $('#payments_page');
        await getPaymentList();

        hideAndShow(item);
    });

    getOrdersList.off().on('click', async function () {
        let item = $('#order_list_page');
        await getOrderList('', startElementsCount);
        hideAndShow(item);

    });


    $('#add_payment').off().on('click', function () {
        let item = $('#add_payment_page');
        hideAndShow(item);
        $('#payment_value_error p').remove();

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
    });


    addNewSelectItemButton.off().on('click', function () {
        let focused = true
        let url = $(this).parent().parent().attr('url');
        let sectionIdName = $(this).closest('section').attr('id');
        let selectItself = '#' + $(this).parent().parent().attr('id');
        let inputItself = '#' + $(selectItself).next().attr('id');
        let inputValueSelector = inputItself + ' :input';
        hideAndShowSelectGroup(selectItself, inputItself, selectItself).then($(inputValueSelector).val(''));


        newOrderAddNewDiscardButton.off().on('click', async function () {
            await hideAndShowSelectGroup(inputItself, selectItself, selectItself);
            $(inputValueSelector).removeClass('new_item_danger');
            focused = false;
        });

        newOrderAddNewSaveButton.off().on('click', async function () {
            await saveNewItem(url, selectItself, inputValueSelector, inputItself, selectItself);
            $(inputValueSelector).removeClass('new_item_danger');
            focused = false;
        });

        // Lost focus
        $('.dynamic_content').off().on('click', async function (e) {
            let eventSectionIdName = $('#' + e.target.id).closest('section').attr('id');
            if (sectionIdName !== eventSectionIdName && focused === true) {
                $(inputValueSelector).focus();
                $(inputValueSelector).addClass('new_item_danger');
                e.stop()
                await hideAndShowSelectGroup(inputItself, selectItself, selectItself).then();
            }
        });
    });


    async function createSelectField(url, selectElementId = null, selectedItemValue = null, groupHide = null, groupShow = null) {


        $(selectElementId + ' select *').each(function () {
            $(this).remove();
        });
        $(selectElementId + ' select').append(`<option value="" hidden></option>`);

        let response = await fetch(url);
        let data = await response.json();

        for (let item of data) {
            $(selectElementId + ' select').append(`<option value="${item.id}">${item.name}</option>`);
        }

        if (selectedItemValue) {
            $(selectElementId + ' option').each(function () {

                if (parseInt($(this).val()) === selectedItemValue) {
                    $(this).attr('selected', 'selected');
                    return false;
                }
            });
        }
        hideAndShowSelectGroup(groupHide, groupShow, groupShow).then();
    }


    async function hideAndShowSelectGroup(toHide, toShow, instanceForShow = null) {

        if (instanceForShow === toShow) {
            addNewSelectItemButton.prop('disabled', false).fadeTo(10, 1);
        } else {
            addNewSelectItemButton.prop('disabled', true).fadeTo(10, 0.2);
        }
        $(toHide).prop('hidden', true);
        $(toShow).prop('hidden', false);
    }

    async function saveNewItem(url, selectItself, newItemSelector, toHide, toShow) {
        let new_type_name = {
            'name': $(newItemSelector).val(),
        }
        let options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(new_type_name)
        }
        let response = await fetch(url, options);
        let data = await response.json();

        if (response.status === 201) {
            await createSelectField(url, selectItself, parseInt(data.id), toHide, toShow);
        } else {
            alert(response.status);
        }
    }


    function holdActions() {

        staticContent.fadeTo(100, 0.5).css('pointer-events', 'none');
        staticContent.parent().css('background', 'black');
    }

    function releaseActions() {

        staticContent.css('pointer-events', 'auto').fadeTo(100, 1);
    }


    function resetNewOrder() {
        $('#new_order_form').each(function () {
            this.reset();
        });
    }

    async function createConditionsField(placeSelectorName, url, selected = null) {
        $(placeSelectorName + ' div').each(function () {
            $(this).remove();
        });

        let response = await fetch(url);
        let data = await response.json();
        for (let condition of data) {
            let item = `<div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" value="${condition.id}" id="">
                            <label class="form-check-label" for="flexCheckDefault">
                                ${condition.name}
                            </label>
                        </div>`
            $(placeSelectorName).append(item);
        }
    }


    newOrderSaveButton.off().on('click', async function () {
        validator();
        if ($('#new_order_form').valid()) {
            await newOrderSave().then();
        }
    });

    function hideAndShow(item = NaN) {
        $('.dynamic_content').prop('hidden', true).hide();
        removeErrors();
        item.prop('hidden', false).fadeIn(100);
    }

    function removeErrors() {
        $('.error').each(function () {
            if ($(this).is('label')) {
                $(this).remove();
            }
        });
    }

    function listElementCount(val = screen.width) {
        if (val < 1920) {
            return '11'
        }
        return '18'
    }

    let lastPagesCount = null;
    let startElementsCount = listElementCount();


    getOrderList('', startElementsCount).then();
});


