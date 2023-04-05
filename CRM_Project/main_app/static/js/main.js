$(document).ready(function (){
    let first_name = 'test name';


    $.ajax({
        url: '/api/v1/orders/',
        method: 'GET',
    }).done(function (response){
        for (let i in response){
            let item = `<tr id="row"><th scope="row"><a class="a_general" href="">${response[i].order_id} <a href="" hidden="">${response[i].id}</a>
                </a></th><td>${response[i].client}</td><td>Otto</td><td>@mdo</td><td>@mdo</td></tr>`;
            $('#orders').append(item);
            // alert(response)
        }


    });



    $('#orders').on('click', 'a', function (e){
        e.preventDefault();
        // alert($(this).text())
        $('#order_list').hide();
        $('#order_detail').removeAttr('hidden');
        let order, client;
            $.ajax({
                url: '/api/v1/orders/'
            })



    });

});
