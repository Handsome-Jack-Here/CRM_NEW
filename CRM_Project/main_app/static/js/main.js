$(document).ready(function () {

        async function saveOrder(order_num, client_num) {
            $('#order_detail').attr('hidden', true);

            let order = {
                // "id": 85,
                // "order_id": 5,
                'defect': $('#defect').val(),
                'first_name': $('#first_name').val(),
                'last_name': $('#last_name').val(),
                'phone': $('#phone_number').val(),


            }
            let options = {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "token a4b09fcc7db19bab22a3e7dfe89cc1ff7cd0c1eb",
                },
                body: JSON.stringify(order)
            }

            await fetch(`/api/v1/orders/${order_num}/`, options);
            await fetch(`/api/v1/clients/${client_num}/`, options);


            getOrderList().then( $('#order_list').fadeIn(200))

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



            $('#save').off().click(function (e) {
                e.preventDefault()
                saveOrder(order_id, order.client)
            })

        }

        $('#orders').on('click', 'a', function (e) {
            e.preventDefault();
            let order_id = $(this).text();
            getOrderDetail(order_id = order_id).then()

        });

        getOrderList().then($('#order_list').fadeIn(200))
    }
)
;

