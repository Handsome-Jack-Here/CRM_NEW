$(document).ready(function () {


    // get the CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');


    async function newOrderSave() {
        $('#new_order_form').attr('hidden', true);

        let order = {
            'first_name': $('#new_order_form #first_name').val(),
            'last_name': $('#new_order_form #last_name').val(),
            'phone': $('#new_order_form #phone_number').val(),
        }

        let options = {

            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(order)
        }

        const response = await fetch(`/api/v1/clients/`, options)
        let data = await response.json()
        let client_id = JSON.stringify(data.id)


        if (response.status === 201) {
            $('#client_form').each(function () {
                this.reset()
                getOrderList().then($('#order_list').fadeIn(200))
            })

        } else {
            alert(response.status)
            $('#new_order_form').removeAttr('hidden');
        }


    }


    async function saveOrder(order_num, client_num) {
        $('#order_detail').attr('hidden', true);

        let order = {
            'defect': $('#defect').val(),
            'first_name': $('#first_name').val(),
            'last_name': $('#last_name').val(),
            'phone': $('#phone_number').val(),


        }
        let options = {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(order)
        }

        await fetch(`/api/v1/orders/${order_num}/`, options);
        await fetch(`/api/v1/clients/${client_num}/`, options);


        getOrderList().then($('#order_list').fadeIn(200))

    }

    async function getOrderList() {
        $('#order_list tbody *').remove();
        const response = await fetch('/api/v1/orders/');
        const orders = await response.json();
        for (let order of orders) {
            const response1 = await fetch(`/api/v1/clients/${order.client}/`);
            const client = await response1.json();
            $('#order_list tbody').append(`<tr><td><a href="" style="text-decoration: none" ">${order.order_id}</a></td><td>${client.first_name} ${client.last_name}</td><td>None</td><td>${order.defect}</td><td>Stage none</td></tr>`)
        }
        $('#order_list').attr('hidden', false)
    }

    async function getOrderDetail(order_id) {

        let check_summ = []

        $('#order_list').hide();
        $('#order_detail').removeAttr('hidden');
        const order_detail = await fetch(`/api/v1/orders/${order_id}/`);
        const order = await order_detail.json();
        const client_detail = await fetch(`/api/v1/clients/${order.client}/`);
        const client = await client_detail.json();
        $('#order_id').text('Order# ' + order_id)

        $('#defect').val(order.defect);
        $('#first_name').val(client.first_name);
        $('#last_name').val(client.last_name);
        $('#phone_number').val(client.phone);

        check_summ += JSON.stringify(order) + JSON.stringify(client)
        // alert(check_summ)

        $('#save').off().click(function (e) {
            e.preventDefault();
            saveOrder(order_id, order.client)
        })

    }

    $('#orders').on('click', 'a', function (e) {
        e.preventDefault();
        let order_id = $(this).text();
        $('#discard').prop('disabled', true);

        $('#discard').on('click', function () {

        })


        getOrderDetail(order_id = order_id).then()

    });


    $('#new_order').on('click', function () {
        $('#order_list').hide();
        $('#new_order_form').removeAttr('hidden');
    })

// validate forms
    $('#create_order').on('click', function () {
        $('#client_form').validate({

            rules: {
                first_name: {
                    required: true,
                    minlength: 2,
                },
                last_name: {
                    required: true,
                    minlength: 2,
                },
                phone_number: {
                    required: true,
                    minlength: 10,

                }
            },
            messages: {
                first_name: {
                    required: 'This field is required',
                    minlength: 'This field mest be at least 2 characters',
                },
                last_name: {
                    required: 'This field is required',
                    minlength: 'This field mest be at least 2 characters',
                },
                phone_number: {
                    required: 'This field is required',
                    minlength: 'This field mest be at least 10 characters',
                },
            }
        })

        if ($('#client_form').valid()) {
            newOrderSave()
        }

    })


    getOrderList().then($('#order_list').fadeIn(200))
});

