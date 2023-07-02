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
            unit_type: {
                required: true,
            },
            brand: {
                required: true,

            },
            model: {
                required: true,

            },
            serial_number: {
                required: true,

            },
            defect: {
                required: true,
                minlength: 7,
            },

        },

        messages: {
            first_name: {
                required: 'This field is required',
                minlength: 'Minimum 2 characters',
            },
            last_name: {
                required: 'This field is required',
                minlength: 'Minimum 2 characters',
            },
            phone_number: {
                required: 'This field is required',
                minlength: 'Minimum 10 characters',
            },
            unit_type: {
                required: 'Please select unit type',
            },
            brand: {
                required: 'Please select unit brand',

            },
            model: {
                required: 'This field is required',

            },
            serial_number: {
                required: 'This field is required',

            },
            defect: {
                required: 'This field is required',
                minlength: 'Minimum 7 characters'
            }

        },
        errorPlacement: function (error, element) {
            if ($(element).text()){
                error.insertBefore(element.parent());
            }
            else {
                error.insertBefore(element);
            }

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
                minlength: 'This field must be at least 2 characters',
            },
            payment_value: {
                required: 'This field is required',
                min: 'This value must be at least 0',
            },
            errorElement: 'span',
            errorLabelContainer: '.error',
        }
    })

    $('#nf').validate({

        rules: {
            sp_description: {
                required: true,
                minlength: 2,
            },
            sp_price: {
                digits: true,
                required: true,

            }
        },

        messages: {
            sp_description: {
                required: 'Description field is required',
                minlength: 'Description field must be at least 2 characters',

            },
            sp_price: {
                required: 'Price field is required',
                digits: 'Price field must be digit'
            }
        },

    })
}

export {validator}