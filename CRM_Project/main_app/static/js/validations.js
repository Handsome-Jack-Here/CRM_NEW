function validator() {
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
            brand: {
                required: true,
                minlength: 1,
            },
            model: {
                required: true,
                minlength: 1,
            },
            serial_number: {
                required: true,
                minlength: 1,
            },
            defect: {
                required: true,
                minlength: 7,
            },

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
            brand: {
                required: 'This field is required',
                minlength: 'This field mest be at least 10 characters',
            },
            model: {
                required: 'This field is required',
                minlength: 'This field mest be at least 10 characters',
            },
            serial_number: {
                required: 'This field is required',
                minlength: 'This field mest be at least 10 characters',
            },
            defect: {
                required: 'This field is required',
                minlength: 'This field mest be at least 7 characters'
            },
        }
    })

    $('#new_payment_form').validate({

        rules: {
            payment_comment: {
                required: true,
                minlength: 2,
            },
            payment_value: {
                required: true,
                min: 1,
            }
        },

        messages: {
            payment_comment: {
                required: 'This field is required',
                minlength: 'This field mest be at least 2 characters',
            },
            payment_value: {
                required: 'This field is required',
                min: 'This value mest be at least 0',
            },
        }
    })
}

    export {validator}