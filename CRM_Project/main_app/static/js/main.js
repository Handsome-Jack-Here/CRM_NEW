$(document).ready(function () {
    let first_name = 'test name';


    $.ajax({
        url: '/api/v1/orders/',
        method: 'GET',
    }).done(function (response) {
        for (let i in response) {



            let item = `<tr id="row"><th scope="row"><a class="a_general" href="">${response[i].order_id} <a href="" hidden="">${response[i].id}</a>
                </a></th><td>${response[i].client}</td><td>Otto</td><td>@mdo</td><td>@mdo</td></tr>`;
            $('#orders').append(item);
        }


    });

    let orders = fetch('/api/v1/orders/1',)
        .then(response => response.json())
        .then(function (data) {return data.order_id})
        alert(orders)
    document.getElementBy('orders').append()





    $('#orders').on('click', 'a', function (e) {
        e.preventDefault();
        let item = $(this).text()

        $('#order_list').hide();
        $('#order_detail').removeAttr('hidden');
        $.ajax({
            url: `/api/v1/orders/${item}/`,
            method: 'GET',
        }).done(function (response) {
            let order = response
            $('#defect').val(order.defect)
            // alert('done')
        })


    });

});
