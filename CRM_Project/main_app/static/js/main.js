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
        $('#new_order').attr('hidden', true);

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

        let order_fields = {
            'defect': $('#new_order_form #defect').val(),
            'client': client_id
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
                getOrderList().then($('#order_list').fadeIn(200))
            })

        } else {
            alert(response.status)
            $('#new_order').removeAttr('hidden');
        }


    }


    async function saveOrder(order_num, client_num) {
        $('#order_detail').attr('hidden', true);

        let order = {
            'defect': $('#defect').val(),
            'diagnostic_result': $('#diagnostic_result').val(),
            'required_works': $('#required_works').val(),
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

        await fetch(`/api/v1/clients/${client_num}/`, options)
            .then(async function () {
                await fetch(`/api/v1/orders/${order_num}/`, options)
            }).then(function () {
                getOrderList().then($('#order_list').fadeIn(200))
            });
    }

    async function getOrderList(search = '') {

        // search filter
        $('.form-control-dark').off().on('input', function (e) {
            e.preventDefault()
            search = $('.form-control-dark').val()
            getOrderList(search)
        })

        async function clear() {
            $('#order_list tbody *').remove()
        }

        clear().then(function () {
            listCreate()
        })

        async function listCreate() {
            const response = await fetch(`/api/v1/orders/` + `?search=${search}`);
            let orders = await response.json()
            for (let order of orders) {
                let client_image = order.client_image.split(' ')
                $('#order_list tbody').append(`<tr><td><a href="" style="text-decoration: none" ">${order.order_id}</a></td><td>${client_image[0]} ${client_image[1]} </td><td>None</td><td>${order.defect}</td><td>Stage none</td></tr>`)
            }
            $('#order_list').attr('hidden', false)
        }
    }

    async function getOrderDetail(order_id) {


        $('#order_list').hide();
        $('#order_detail').removeAttr('hidden');
        const order_detail = await fetch(`/api/v1/orders/${order_id}/`);
        const order = await order_detail.json();
        const client_detail = await fetch(`/api/v1/clients/${order.client}/`);
        const client = await client_detail.json();
        $('#order_id').text('Order# ' + order_id)

        $('#defect').val(order.defect);
        $('#diagnostic_result').val(order.diagnostic_result);
        $('#required_works').val(order.required_works);

        $('#first_name').val(client.first_name);
        $('#last_name').val(client.last_name);
        $('#phone_number').val(client.phone);

        $('.text-end').hide()

        $('.time_field span').empty()
        $('#creation_date').append(order.created.slice(0, 10))
        $('#creation_time').append(order.created.slice(11, 16))
        $('#update_date').append(order.edited.slice(0, 10))
        $('#update_time').append(order.edited.slice(11, 16))

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
            alert('discard');

        });


        getOrderDetail(order_id = order_id).then()
    });


    $('#new_order_button').on('click', function () {
        $('#order_list').hide();
        $('#new_order').removeAttr('hidden');
    })


// validate forms
    $('#create_order').on('click', function () {
        $('#new_order_form').validate({

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
                },
                defect: {
                    required: true,
                    minlength: 7,
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
                defect: {
                    required: 'This field is required',
                    minlength: 'This field mest be at least 7 characters'
                },
            }
        })

        if ($('#new_order_form').valid()) {
            newOrderSave()
        }

    })


    getOrderList().then($('#order_list').fadeIn(200))
});

