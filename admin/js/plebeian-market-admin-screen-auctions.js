function setFormDefaultValues() {
    let starting_bid = document.getElementById('starting_bid');
    if (!starting_bid.value) {
        starting_bid.value = 0;
    }

    let reserve_bid = document.getElementById('reserve_bid');
    if (!reserve_bid.value) {
        reserve_bid.value = 0;
    }

    let shipping_domestic_usd = document.getElementById('shipping_domestic_usd');
    if (!shipping_domestic_usd.value) {
        shipping_domestic_usd.value = 0;
    }

    let shipping_worldwide_usd = document.getElementById('shipping_worldwide_usd');
    if (!shipping_worldwide_usd.value) {
        shipping_worldwide_usd.value = 0;
    }

    let duration = document.getElementById('duration');
    if (!duration.value) {
        duration.value = 3;
        document.getElementById('duration_unit').value = 'd';
    }
}

$(document).ready( function () {
    itemsDatatable = $('#table_items').DataTable({
        ajax: {
            url: requests.pm_api.auction.list.url,
            dataSrc: 'auctions',
            headers: { "X-Access-Token": requests.pm_api.XAccessToken }
        },
        order: [[4, 'desc']],
        dom: '<"toolbar">Bfrtip',
        //select: true,
        buttons: [
            'colvis',
            'csv',
            {
                text: 'New Auction',
                className: 'newItemButton',
                attr: {
                    'data-bs-toggle': 'modal',
                    'data-bs-target': '#add-item-modal'
                }
            }
        ],
        language: {
            "emptyTable": "Create your first auction using the <b>New Auction button</b>",
            "info": "Showing _START_ to _END_ of _TOTAL_ auctions",
            "sInfoEmpty": "You have no auctions yet"
        },
        columns: [
            {
                data: 'key'
            },
            {
                data: 'title'
            },
            {
                render: function (data, type, row) {
                    return row.media.length;
                },
                className: "dt-center"
            },
            {
                render: function (data, type, row) {
                    let duration_hours = row.duration_hours;

                    if (type === 'display') {
                        if (duration_hours % 24 === 0) {
                            return duration_hours + ' h (' + duration_hours / 24 + ' d)';
                        } else {
                            if (duration_hours < 24) {
                                return duration_hours + ' h';
                            } else {
                                return duration_hours + ' h (>' + Math.floor(duration_hours / 24) + ' d)';
                            }
                        }
                    } else {
                        return duration_hours;
                    }

                },
                className: "dt-center"
            },
            {
                data: 'created_at',
                className: "dt-center"
            },
            {
                render: function (data, type, row) {
                    if (!row.started) {
                        return '<button type="button" class="btn btn-primary btn-sm confirmActionButton" data-action="publish" data-pmtype="auction" data-key="' + row.key + '" data-title="' + row.title + '">Publish</button>';
                    }
                    return moment(row.start_date).format('D/M/YYYY, H:mm:ss');
                },
                className: "dt-center"
            },
            {
                data: 'end_date',
                className: "dt-center"
            },
            {
                render: function (data, type, row) {
                    if (!row.started) {
                        return 'Draft (unpublished)'
                    } else if (row.ended) {
                        return 'Ended';
                    } else {
                        let start_date = moment(row.start_date);
                        let end_date = moment(row.end_date);
                        let now = moment();

                        let total_duration_seconds = moment.duration(end_date.diff(start_date)).asSeconds();
                        let remaining_duration = moment.duration(end_date.diff(now));
                        let elapsed_duration_seconds = total_duration_seconds - remaining_duration.asSeconds();

                        if (type === 'display') {
                            let popup = 'data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Auction ends ' + remaining_duration.humanize(true) + '."';
                            return '<progress value="'+elapsed_duration_seconds+'" max="'+total_duration_seconds+'" '+popup+'></progress>';
                        } else {
                            return remaining_duration.asSeconds() / total_duration_seconds;
                        }
                    }
                },
                className: "dt-center"
            },
            {
                data: 'starting_bid',
                className: "dt-center"
            },
            {
                render: function (data, type, row) {
                    return row.bids.length;
                },
                className: "dt-center"
            },
            {
                render: function (data, type, row) {
                    let highest_bid = row.bids[0]?.amount ?? '';

                    if (type === 'display') {
                        let reserve_bid_reached = row.reserve_bid_reached;
                        let reserve_bid = row.reserve_bid;

                        let color = 'black';
                        let popup = '';

                        if (reserve_bid > 0 && !reserve_bid_reached) {
                            color = 'red';
                            popup = 'data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Reserve price of '+reserve_bid+' sats not met yet."';
                        }

                        return '<span style="color:' + color + '" '+popup+'>' + highest_bid + '</span>';
                    } else {
                        return highest_bid ?? 0;
                    }
                },
                className: "dt-center"
            },
            {
                render: function (data, type, row) {
                    let key = row.key;
                    let title = row.title;

                    let iconsToBeDisplayed = '';

                    if (row.started) {
                        iconsToBeDisplayed += '<img src="' + pluginBasePath + 'admin/img/pencil-square.svg" class="dataTablesActionIconDisabled" data-pmtype="auction" data-key="' + key + '" data-title="' + title + '" alt="Edit item" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit is disabled because the auction already started">';
                        iconsToBeDisplayed += '<img src="' + pluginBasePath + 'admin/img/trash.svg" class="dataTablesActionIconDisabled" data-pmtype="auction" data-key="' + key + '" data-title="' + title + '" alt="Delete item" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Delete is disabled because the auction already started">';
                    } else {
                        iconsToBeDisplayed += '<img src="' + pluginBasePath + 'admin/img/pencil-square.svg" class="dataTablesActionIcon editButton" data-pmtype="auction" data-key="' + key + '" data-title="' + title + '" alt="Edit item" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit">';
                        iconsToBeDisplayed += '<img src="' + pluginBasePath + 'admin/img/trash.svg" class="dataTablesActionIcon confirmActionButton" data-action="delete" data-pmtype="auction" data-key="' + key + '" data-title="' + title + '" alt="Delete item" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Delete">';
                    }

                    iconsToBeDisplayed += '<img src="' + pluginBasePath + 'admin/img/code-square.svg" class="dataTablesActionIcon copyShortCodeButton" data-pmtype="auction" data-key="' + key + '" alt="Copy Shortcode" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Copy shortcode">';
                    return iconsToBeDisplayed;
                },
                className: "dt-center"
            }
        ],
        columnDefs: [
            {
                targets: 1,
                render: DataTable.render.text(),
            },
            {
                targets: [4, 5, 6],
                render: DataTable.render.datetime(),
            },
            {
                targets: 10,
                width: '10%'
            },
        ],
        fixedColumns: true

    }).on('draw', function () {
        $("#table_items").show();
        rebindIconClicks();

        // Enable button tooltips
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

        $('.newItemButton').click(function () {
            $('#titleModalItemInfo').text('New Auction');
            clearForm();
            setFormDefaultValues();
        })
    });
});
