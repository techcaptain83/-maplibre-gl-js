window.darkdemotiles = {
    "id": "dark-demotiles",
    "name": "MapLibre Dark",
    "zoom": 0.8619833357855968,
    "pitch": 0,
    "center": [
        17.65431710431244,
        32.954120326746775
    ],
    "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    "layers": [
        {
            "id": "background",
            "type": "background",
            "paint": {
                "background-color": ["rgb", 0x00, 0x3d, 0x5c]
            },
            "filter": [
                "all"
            ],
            "layout": {
                "visibility": "visible"
            },
            "maxzoom": 24
        },
        {
            "id": "coastline",
            "type": "line",
            "paint": {
                "line-blur": 0.5,
                "line-color": "#bbe3f7",
                "line-width": {
                    "stops": [
                        [
                            0,
                            2
                        ],
                        [
                            6,
                            6
                        ],
                        [
                            14,
                            9
                        ],
                        [
                            22,
                            18
                        ]
                    ]
                }
            },
            "filter": [
                "all"
            ],
            "layout": {
                "line-cap": "round",
                "line-join": "round",
                "visibility": "visible"
            },
            "source": "maplibre",
            "maxzoom": 24,
            "minzoom": 0,
            "source-layer": "countries"
        },
        {
            "id": "countries-fill",
            "type": "fill",
            "paint": {
                "fill-color": [
                    "match",
                    [
                        "get",
                        "ADM0_A3"
                    ],
                    [
                        "ARM",
                        "ATG",
                        "AUS",
                        "BTN",
                        "CAN",
                        "COG",
                        "CZE",
                        "GHA",
                        "GIN",
                        "HTI",
                        "ISL",
                        "JOR",
                        "KHM",
                        "KOR",
                        "LVA",
                        "MLT",
                        "MNE",
                        "MOZ",
                        "PER",
                        "SAH",
                        "SGP",
                        "SLV",
                        "SOM",
                        "TJK",
                        "TUV",
                        "UKR",
                        "WSM"
                    ],
                    "#31264f",
                    [
                        "AZE",
                        "BGD",
                        "CHL",
                        "CMR",
                        "CSI",
                        "DEU",
                        "DJI",
                        "GUY",
                        "HUN",
                        "IOA",
                        "JAM",
                        "LBN",
                        "LBY",
                        "LSO",
                        "MDG",
                        "MKD",
                        "MNG",
                        "MRT",
                        "NIU",
                        "NZL",
                        "PCN",
                        "PYF",
                        "SAU",
                        "SHN",
                        "STP",
                        "TTO",
                        "UGA",
                        "UZB",
                        "ZMB"
                    ],
                    "#544018",
                    [
                        "AGO",
                        "ASM",
                        "ATF",
                        "BDI",
                        "BFA",
                        "BGR",
                        "BLZ",
                        "BRA",
                        "CHN",
                        "CRI",
                        "ESP",
                        "HKG",
                        "HRV",
                        "IDN",
                        "IRN",
                        "ISR",
                        "KNA",
                        "LBR",
                        "LCA",
                        "MAC",
                        "MUS",
                        "NOR",
                        "PLW",
                        "POL",
                        "PRI",
                        "SDN",
                        "TUN",
                        "UMI",
                        "USA",
                        "USG",
                        "VIR",
                        "VUT"
                    ],
                    "#2f4318",
                    [
                        "ARE",
                        "ARG",
                        "BHS",
                        "CIV",
                        "CLP",
                        "DMA",
                        "ETH",
                        "GAB",
                        "GRD",
                        "HMD",
                        "IND",
                        "IOT",
                        "IRL",
                        "IRQ",
                        "ITA",
                        "KOS",
                        "LUX",
                        "MEX",
                        "NAM",
                        "NER",
                        "PHL",
                        "PRT",
                        "RUS",
                        "SEN",
                        "SUR",
                        "TZA",
                        "VAT"
                    ],
                    "#4f4e1c",
                    [
                        "AUT",
                        "BEL",
                        "BHR",
                        "BMU",
                        "BRB",
                        "CYN",
                        "DZA",
                        "EST",
                        "FLK",
                        "GMB",
                        "GUM",
                        "HND",
                        "JEY",
                        "KGZ",
                        "LIE",
                        "MAF",
                        "MDA",
                        "NGA",
                        "NRU",
                        "SLB",
                        "SOL",
                        "SRB",
                        "SWZ",
                        "THA",
                        "TUR",
                        "VEN",
                        "VGB"
                    ],
                    "#244729",
                    [
                        "AIA",
                        "BIH",
                        "BLM",
                        "BRN",
                        "CAF",
                        "CHE",
                        "COM",
                        "CPV",
                        "CUB",
                        "ECU",
                        "ESB",
                        "FSM",
                        "GAZ",
                        "GBR",
                        "GEO",
                        "KEN",
                        "LTU",
                        "MAR",
                        "MCO",
                        "MDV",
                        "NFK",
                        "NPL",
                        "PNG",
                        "PRY",
                        "QAT",
                        "SLE",
                        "SPM",
                        "SYC",
                        "TCA",
                        "TKM",
                        "TLS",
                        "VNM",
                        "WEB",
                        "WSB",
                        "YEM",
                        "ZWE"
                    ],
                    "#123f4f",
                    [
                        "ABW",
                        "ALB",
                        "AND",
                        "ATC",
                        "BOL",
                        "COD",
                        "CUW",
                        "CYM",
                        "CYP",
                        "EGY",
                        "FJI",
                        "GGY",
                        "IMN",
                        "KAB",
                        "KAZ",
                        "KWT",
                        "LAO",
                        "MLI",
                        "MNP",
                        "MSR",
                        "MYS",
                        "NIC",
                        "NLD",
                        "PAK",
                        "PAN",
                        "PRK",
                        "ROU",
                        "SGS",
                        "SVN",
                        "SWE",
                        "TGO",
                        "TWN",
                        "VCT",
                        "ZAF"
                    ],
                    "#252a4b",
                    [
                        "ATA",
                        "GRL"
                    ],
                    "#000000",
                    "#4f311c"
                ]
            },
            "filter": [
                "all"
            ],
            "layout": {
                "visibility": "visible"
            },
            "source": "maplibre",
            "maxzoom": 24,
            "source-layer": "countries"
        },
        {
            "id": "countries-boundary",
            "type": "line",
            "paint": {
                "line-color": "rgba(0, 0, 0, 1)",
                "line-width": {
                    "stops": [
                        [
                            1,
                            1
                        ],
                        [
                            6,
                            2
                        ],
                        [
                            14,
                            6
                        ],
                        [
                            22,
                            12
                        ]
                    ]
                },
                "line-opacity": {
                    "stops": [
                        [
                            3,
                            0.5
                        ],
                        [
                            6,
                            1
                        ]
                    ]
                }
            },
            "layout": {
                "line-cap": "round",
                "line-join": "round",
                "visibility": "visible"
            },
            "source": "maplibre",
            "maxzoom": 24,
            "source-layer": "countries"
        },
        {
            "id": "geolines",
            "type": "line",
            "paint": {
                "line-color": "#4b6877",
                "line-opacity": 1,
                "line-dasharray": [
                    3,
                    3
                ]
            },
            "filter": [
                "all",
                [
                    "!=",
                    "name",
                    "International Date Line"
                ]
            ],
            "layout": {
                "visibility": "visible"
            },
            "source": "maplibre",
            "maxzoom": 24,
            "source-layer": "geolines"
        },
        {
            "id": "geolines-label",
            "type": "symbol",
            "paint": {
                "text-color": "#4b6877",
                "text-halo-blur": 1,
                "text-halo-color": "rgba(0, 0, 0, 1)",
                "text-halo-width": 1
            },
            "filter": [
                "all",
                [
                    "!=",
                    "name",
                    "International Date Line"
                ]
            ],
            "layout": {
                "text-font": [
                    "Open Sans Semibold"
                ],
                "text-size": {
                    "stops": [
                        [
                            2,
                            12
                        ],
                        [
                            6,
                            16
                        ]
                    ]
                },
                "text-field": "{name}",
                "visibility": "visible",
                "symbol-placement": "line"
            },
            "source": "maplibre",
            "maxzoom": 24,
            "minzoom": 1,
            "source-layer": "geolines"
        },
        {
            "id": "countries-label",
            "type": "symbol",
            "paint": {
                "text-color": "rgba(190, 214, 248, 1)",
                "text-halo-blur": {
                    "stops": [
                        [
                            2,
                            0.2
                        ],
                        [
                            6,
                            0
                        ]
                    ]
                },
                "text-halo-color": "rgba(0, 0, 0, 1)",
                "text-halo-width": {
                    "stops": [
                        [
                            2,
                            1
                        ],
                        [
                            6,
                            1.6
                        ]
                    ]
                }
            },
            "filter": [
                "all"
            ],
            "layout": {
                "text-font": [
                    "Open Sans Semibold"
                ],
                "text-size": {
                    "stops": [
                        [
                            2,
                            10
                        ],
                        [
                            4,
                            12
                        ],
                        [
                            6,
                            16
                        ]
                    ]
                },
                "text-field": {
                    "stops": [
                        [
                            2,
                            "{ABBREV}"
                        ],
                        [
                            4,
                            "{NAME}"
                        ]
                    ]
                },
                "visibility": "visible",
                "text-max-width": 10,
                "text-transform": {
                    "stops": [
                        [
                            0,
                            "uppercase"
                        ],
                        [
                            2,
                            "none"
                        ]
                    ]
                }
            },
            "source": "maplibre",
            "maxzoom": 24,
            "minzoom": 2,
            "source-layer": "centroids"
        }
    ],
    "bearing": 0,
    "sources": {
        "maplibre": {
            "url": "https://demotiles.maplibre.org/tiles/tiles.json",
            "type": "vector"
        }
    },
    "version": 8,
    "metadata": {
        "maptiler:copyright": "This style was generated on MapTiler Cloud. Usage is governed by the license terms in https://github.com/maplibre/demotiles/blob/gh-pages/LICENSE",
        "openmaptiles:version": "3.x"
    }
};
