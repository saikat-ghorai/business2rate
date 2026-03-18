<?php require 'config/security.php'; ?>
<!DOCTYPE html>
<html>

<head>
    <title>Business2Rate</title>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="./assets/js/raty.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/js/all.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
</head>

<body>

    <input type="hidden" id="csrf" value="<?= $_SESSION['csrf_token'] ?>">

    <div class="container">
        <header class="d-flex flex-wrap justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
            <a href="/business2rate/" class="d-flex align-items-center mb-md-0 text-dark text-decoration-none">
                <img class="img-fluid" src="./assets/image/logo.svg" alt="Business2Rate">
            </a>
            <div class="input-group flex-nowrap" style="max-width: 40% !important;">
                <span class="input-group-text" id="addon-wrapping"><i class="fa-solid fa-magnifying-glass"></i></span>
                <input type="text" id="searchBusiness" class="form-control" placeholder="Business Name/Phone/Email" autocomplete="off">
            </div>
            <ul class="nav nav-pills">
                <li class="nav-item"><a href="#" class="nav-link active" id="addBusiness"><i class="fa-solid fa-square-plus me-2"></i>Business</a></li>
            </ul>
        </header>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Business Name</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Action</th>
                    <th>Rating</th>
                </tr>
            </thead>
            <tbody id="tableBody"></tbody>
        </table>
        <div class="row">
            <div class="col-6" id="dataCount"></div>
            <div class="col-6">
                <div class="mt-3 d-flex gap-2 justify-content-end">
                    <button id="prevBtn" class="btn btn-outline-primary btn-sm"><i class="fa-solid fa-angle-left"></i></button>
                    <button id="nextBtn" class="btn btn-outline-primary btn-sm"><i class="fa-solid fa-angle-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    <!-- Business2Rate Modal -->
    <div class="modal fade" id="b2rModal" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                </div>
            </div>
        </div>
    </div>

    <script src="./assets/js/custom.js"></script>
    <script>
        let page = 1;
        let totalRecords = 0;
        let limit = 0;
        $(document).ready(function() {
            initFromURL();
            loadBusinesses();
        });
    </script>

</body>

</html>