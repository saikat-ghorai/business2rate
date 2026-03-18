$(document).on('input', '.numbers-only', function () {
    let value = $(this).val();
    value = value.replace(/\D/g, '');

    $(this).val(value);
});

// Prevent invalid key presses
$(document).on('keypress', '.numbers-only', function (e) {
    let charCode = e.which ? e.which : e.keyCode;
    if (charCode < 48 || charCode > 57) {
        e.preventDefault();
    }
});

// Handle paste
$(document).on('paste', '.numbers-only', function (e) {
    e.preventDefault();
    let pastedData = (e.originalEvent || e).clipboardData.getData('text');

    let cleaned = pastedData.replace(/\D/g, '');

    $(this).val(cleaned);
});

//Open add new business modal
$(document).on('click', '#addBusiness', function (evt) {
    evt.preventDefault();
    let modalTitle = 'Add new business';
    let modalHtml = '<div class="row">';
    modalHtml += '<div class="col-12">';
    modalHtml += '<input type="text" id="name" name="name" placeholder="Business name*" class="form-control mb-2 validation-required" autocomplete="off">';
    modalHtml += '</div>';
    modalHtml += '<div class="col-12">';
    modalHtml += '<input type="text" id="address" name="address" placeholder="Address" class="form-control mb-2" autocomplete="off">';
    modalHtml += '</div>';
    modalHtml += '<div class="col-6">';
    modalHtml += '<input type="text" id="phone" name="phone" placeholder="Phone*" class="form-control numbers-only mb-2 validation-required" autocomplete="off">';
    modalHtml += '</div>';
    modalHtml += '<div class="col-6">';
    modalHtml += '<input type="email" id="email" name="email" placeholder="Email*" class="form-control mb-2 validation-required" autocomplete="off">';
    modalHtml += '</div>';
    modalHtml += '<div class="col-12 text-end pt-3 mt-5 border-top">';
    modalHtml += '<button class="btn btn-secondary me-3" id="cancelModal"><i class="fa-solid fa-rectangle-xmark me-2"></i>Cancel</button>';
    modalHtml += '<button class="btn btn-primary" id="saveBusiness"><i class="fa-solid fa-floppy-disk me-2"></i>Save</button>';
    modalHtml += '</div>';
    modalHtml += '</div>';
    $('.modal-title').html(modalTitle);
    $('.modal-body').html(modalHtml);
    $('#b2rModal').modal('show');
});

//Close modal
$(document).on('click', '.btn-close, #cancelModal', function (evt) {
    evt.preventDefault();
    $('#b2rModal').modal('hide');
});

//Validation check for all forms
function validateForm(formSelector) {
    let isValid = true;

    $(formSelector + " .validation-required").each(function () {
        let input = $(this);
        let value = input.val().trim();
        let type = input.attr("type");
        input.removeClass("border-danger");

        // Required check
        if (value === "") {
            input.addClass("border-danger");
            isValid = false;
        }

        // Email validation
        if (type === "email") {
            let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                input.addClass("border-danger");
                isValid = false;
            }
        }

        // Number validation
        if (type === "number") {
            if (!/^\d+$/.test(value)) {
                input.addClass("border-danger");
                isValid = false;
            }
        }

        // Min length
        if (input.data("minlength")) {
            if (value.length < input.data("minlength")) {
                input.addClass("border-danger");
                isValid = false;
            }
        }

    });

    return isValid;
}

$(document).on('click', '.validation-required', function (evt) {
    evt.preventDefault();
    $(this).removeClass('border-danger');
});

//Save new business data
$(document).on('click', '#saveBusiness', function (evt) {
    evt.preventDefault();
    if (!validateForm("#b2rModal")) return;

    $.ajax({
        url: '/business2rate/api/business/add',
        method: 'POST',
        dataType: 'JSON',
        headers: {
            'X-CSRF-TOKEN': $('#csrf').val()
        },
        data: JSON.stringify({
            name: $('#name').val(),
            address: $('#address').val(),
            phone: $('#phone').val(),
            email: $('#email').val()
        }),
        error: function () {
            toastr.error("Something went wrong, Try again!");
        },
        success: function (data) {
            if (data.status == 'error') {
                toastr.error(data.errors);
            } else {
                $('#b2rModal').modal('hide');
                toastr.success("New business added successfully!");
            }
            $('#csrf').val(data.csrf_token);
            loadBusinesses();
        }
    });
});

//Load business list
function loadBusinesses() {
    $.get(`/business2rate/api/business/list?page=${page}&search=${$('#searchBusiness').val()}`, function (res) {
        let parsedData = JSON.parse(res);
        let data = parsedData.data;
        let token = parsedData.csrf_token;
        let html = '';
        let offset = initial = 0;

        if (data.length === 0) {
            html = '<tr><td colspan="7" class="text-center">No data found</td></tr>';
        } else {
            offset = initial = (parsedData.page - 1) * parsedData.limit;

            data.forEach(b => {
                html += `
                <tr id="dataRow${b.id}">
                    <td>${offset + 1}</td>
                    <td class="business-name">${b.name}</td>
                    <td class="business-address">${b.address}</td>
                    <td class="business-phone">${b.phone}</td>
                    <td class="business-email">${b.email}</td>
                    <td>
                        <button onclick="openEditBusiness('${b.id}')" class="btn btn-outline-dark btn-sm" title="Edit Business"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button onclick="deleteBusiness('${b.id}')" class="btn btn-outline-danger btn-sm" title="Delete Business"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                    <td class="business-rating">
                        <div class="rating" onclick="openRating('${b.id}')" data-score="${b.avg_rating}"></div>
                    </td>
                </tr>`;
                offset++;
            });
            totalRecords = parsedData.total;
            limit = parsedData.limit;
            let totalPages = Math.ceil(totalRecords / limit);
            page = parsedData.page;
            $('#prevBtn').prop('disabled', page === 1);
            $('#nextBtn').prop('disabled', page === totalPages);
            $('#dataCount').html('Showing ' + (initial + 1) + ' to ' + offset + ' of ' + totalRecords + ' records');

        }
        $('#tableBody').html(html);
        $('#csrf').val(token);
        $('.rating').raty({
            readOnly: true,
            half: true,
            path: '/business2rate/assets/image',
            score: function () {
                return $(this).attr('data-score');
            }
        });
    });
}

function updateURL() {
    const params = new URLSearchParams({
        page,
        limit,
        search: $('#searchBusiness').val()
    });

    const newUrl = window.location.pathname + '?' + params.toString();

    history.pushState({ page }, '', newUrl);
}

function initFromURL() {
    const params = new URLSearchParams(window.location.search);

    page = parseInt(params.get('page')) || 1;

    limit = parseInt(params.get('limit')) || 25;
    let search = params.get('search') || '';

    $('#limit').val(limit);
    $('#searchBusiness').val(search);
}

$(document).on('click', '#nextBtn', function () {
    page++;
    updateURL();
    loadBusinesses();
});

$(document).on('click', '#prevBtn', function () {
    if (page > 1) page--;
    updateURL();
    loadBusinesses();
});

//Open edit business modal
function openEditBusiness(id) {
    $.get('/business2rate/api/business/details?id=' + id, function (res) {
        let parsedData = JSON.parse(res);
        let data = parsedData.data;
        let token = parsedData.csrf_token;

        $('#csrf').val(token);
        let modalTitle = 'Edit business';
        let modalHtml = '<div class="row">';
        modalHtml += '<div class="col-12">';
        modalHtml += '<input type="text" id="name" name="name" placeholder="Business name*" class="form-control mb-2 validation-required" autocomplete="off" value="' + data.name + '">';
        modalHtml += '</div>';
        modalHtml += '<div class="col-12">';
        modalHtml += '<input type="text" id="address" name="address" placeholder="Address" class="form-control mb-2" autocomplete="off" value="' + data.address + '">';
        modalHtml += '</div>';
        modalHtml += '<div class="col-6">';
        modalHtml += '<input type="text" id="phone" name="phone" placeholder="Phone*" class="form-control numbers-only mb-2 validation-required" autocomplete="off" value="' + data.phone + '">';
        modalHtml += '</div>';
        modalHtml += '<div class="col-6">';
        modalHtml += '<input type="email" id="email" name="email" placeholder="Email*" class="form-control mb-2 validation-required" autocomplete="off" value="' + data.email + '">';
        modalHtml += '</div>';
        modalHtml += '<div class="col-12 text-end pt-3 mt-5 border-top">';
        modalHtml += '<button class="btn btn-secondary me-3" id="cancelModal"><i class="fa-solid fa-rectangle-xmark me-2"></i>Cancel</button>';
        modalHtml += '<input type="hidden" id="dataRow" name="dataRow" value="' + data.id + '">';
        modalHtml += '<button class="btn btn-primary" id="updateBusinessData"><i class="fa-solid fa-floppy-disk me-2"></i>Update</button>';
        modalHtml += '</div>';
        modalHtml += '</div>';
        $('.modal-title').html(modalTitle);
        $('.modal-body').html(modalHtml);
        $('#b2rModal').modal('show');
    });
}

//Update business data
$(document).on('click', '#updateBusinessData', function (evt) {
    evt.preventDefault();
    if (!validateForm("#b2rModal")) return;
    let businessId = $('#dataRow').val();

    $.ajax({
        url: '/business2rate/api/business/update',
        method: 'POST',
        dataType: 'JSON',
        headers: {
            'X-CSRF-TOKEN': $('#csrf').val()
        },
        data: JSON.stringify({
            id: $('#dataRow').val(),
            name: $('#name').val(),
            address: $('#address').val(),
            phone: $('#phone').val(),
            email: $('#email').val()
        }),
        error: function () {
            toastr.error("Something went wrong, Try again!");
        },
        success: function (data) {
            if (data.status == 'error') {
                toastr.error(data.errors);
            } else {
                $('#b2rModal').modal('hide');
                toastr.success("Business updated successfully!");
                $(`#dataRow${businessId}`).find('.business-name').html($('#name').val());
                $(`#dataRow${businessId}`).find('.business-address').html($('#address').val());
                $(`#dataRow${businessId}`).find('.business-phone').html($('#phone').val());
                $(`#dataRow${businessId}`).find('.business-email').html($('#email').val());
            }
            $('#csrf').val(data.csrf_token);
        }
    });
});

//Delete a business
function deleteBusiness(id) {
    let businessName = $(`#dataRow${id}`).find('.business-name').text();
    if (!confirm("Are you sure you want to delete "+ businessName + "? This action cannot be undone.")) return;

    $.ajax({
        url: '/business2rate/api/business/delete',
        method: 'POST',
        dataType: 'JSON',
        headers: {
            'X-CSRF-TOKEN': $('#csrf').val()
        },
        data: JSON.stringify({
            id
        }),
        success: function (data) {
            if (data.status == 'error') {
                toastr.error(data.errors);
            } else {
                toastr.success("Business deleted successfully!");
                adjustPageAfterDelete();
            }
            $('#csrf').val(data.csrf_token);
        }
    });
}

function adjustPageAfterDelete() {
    totalRecords--;

    let totalPages = Math.ceil(totalRecords / limit);

    if (page > totalPages && totalPages > 0) {
        page = totalPages;
    }

    if (totalPages === 0) {
        page = 1;
    }
    console.log(page);

    loadBusinesses();
}

//Open rate business modal
function openRating(id) {
    $.get('/business2rate/api/business/details?id=' + id, function (res) {
        let parsedData = JSON.parse(res);
        let data = parsedData.data;
        let token = parsedData.csrf_token;

        $('#csrf').val(token);
        let modalTitle = 'Give rating to ' + data.name;
        let modalHtml = '<div class="row">';
        modalHtml += '<div class="col-12">';
        modalHtml += '<input type="text" id="name" name="name" placeholder="Name*" class="form-control mb-2 validation-required" autocomplete="off" value="">';
        modalHtml += '</div>';
        modalHtml += '<div class="col-6">';
        modalHtml += '<input type="text" id="phone" name="phone" placeholder="Phone*" class="form-control numbers-only mb-2 validation-required" autocomplete="off" value="">';
        modalHtml += '</div>';
        modalHtml += '<div class="col-6">';
        modalHtml += '<input type="email" id="email" name="email" placeholder="Email*" class="form-control mb-2 validation-required" autocomplete="off" value="">';
        modalHtml += '</div>';
        modalHtml += '<div class="col-12">';
        modalHtml += '<div class="mb-3">';
        modalHtml += '<label for="ratingInput" class="form-label">Rating<span class="text-danger">*</span> <span class="small text-danger" id="errRating"></span></label>'
        modalHtml += '<div id="ratingInput"></div>';
        modalHtml += '</div>';
        modalHtml += '</div>';
        modalHtml += '<div class="col-12 text-end pt-3 mt-5 border-top">';
        modalHtml += '<button class="btn btn-secondary me-3" id="cancelModal"><i class="fa-solid fa-rectangle-xmark me-2"></i>Cancel</button>';
        modalHtml += '<input type="hidden" id="dataRow" name="dataRow" value="' + data.id + '">';
        modalHtml += '<button class="btn btn-primary" id="submitRating"><i class="fa-solid fa-floppy-disk me-2"></i>Save</button>';
        modalHtml += '</div>';
        modalHtml += '</div>';
        $('.modal-title').html(modalTitle);
        $('.modal-body').html(modalHtml);
        $('#b2rModal').modal('show');

        $('#csrf').val(token);
        $('#ratingInput').raty({
            half: true,
            path: '/business2rate/assets/image',
            click: function (score) {
                window.selectedRating = score;
            }
        });
    });
}

//Save rating data
$(document).on('click', '#submitRating', function (evt) {
    evt.preventDefault();
    let businessId = $('#dataRow').val();

    if (!validateForm("#b2rModal") || !window.selectedRating) {
        if (!window.selectedRating) {
            $('#errRating').html("required");
        }
        return;
    }

    $.ajax({
        url: '/business2rate/api/rating/add',
        method: 'POST',
        dataType: 'JSON',
        headers: {
            'X-CSRF-TOKEN': $('#csrf').val()
        },
        data: JSON.stringify({
            business_id: businessId,
            name: $('#name').val(),
            phone: $('#phone').val(),
            email: $('#email').val(),
            rating: window.selectedRating
        }),
        error: function () {
            toastr.error("Something went wrong, Try again!");
        },
        success: function (data) {
            if (data.status == 'error') {
                toastr.error(data.errors);
            } else {
                $('#b2rModal').modal('hide');
                toastr.success("Rating added successfully!");
                $(`#dataRow${businessId}`).find('.business-rating').html('<div class="rating" onclick="openRating(' + businessId + ')" data-score="' + data.avg + '"></div>');
            }
            $('#csrf').val(data.csrf_token);
            $('.rating').raty({
                readOnly: true,
                half: true,
                path: '/business2rate/assets/image',
                score: function () {
                    return $(this).attr('data-score');
                }
            });
        }
    });
});

//Search business
function debounce(func, delay) {
    let timer;

    return function (...args) {
        clearTimeout(timer);

        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
const debouncedSearch = debounce(function () {
    page = 1;
    loadBusinesses();
}, 400);
$(document).on('input', '#searchBusiness', function () {
    let html = '<tr>';
    html += '<td colspan="7" class="text-center">';
    html += '<div class="spinner-border text-primary" role="status">';
    html += '<span class="visually-hidden">Loading...</span>';
    html += '</div>';
    html += '</td>';
    html += '</tr>';
    $('#tableBody').html(html);
    debouncedSearch();
    updateURL();
});