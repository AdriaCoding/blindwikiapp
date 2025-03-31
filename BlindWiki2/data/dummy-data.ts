import { t } from "i18next";
import { Message } from "@/models/message";
import { Tag } from "@/models/tag";
import Language from "@/models/language";
import { Area } from "@/models/area";

export const ALL_AREAS: Area[] = [
  {
    id: 322,
    name: "metropolitan_city_of_venice",
    displayName: "Venecia", 
    message_count: "1257",
    path: "/area322"
  },
  {
    id: 276,
    name: "s%C3%A3o_paulo",
    displayName: "São Paulo",
    message_count: "552",
    path: "/area276"
  },
  {
    id: 693,
    name: "municipality_of_valencia",
    displayName: "Valencia",
    message_count: "285",
    path: "/area693"
  },
  {
    id: 308,
    name: "wroc%C5%82aw_county",
    displayName: "Breslavia",
    message_count: "254",
    path: "/area308"
  },
  {
    id: 309,
    name: "santiago_de_compostela",
    displayName: "Santiago de Compostela",
    message_count: "185",
    path: "/area309"
  },
  {
    id: 279,
    name: "sydney_metropolitan_area",
    displayName: "Sídney",
    message_count: "128",
    path: "/area279"
  },
  {
    id: 288,
    name: "berlin_metropolitan_area",
    displayName: "Berlín",
    message_count: "126",
    path: "/area288"
  },
  {
    id: 489,
    name: "province_of_trieste",
    displayName: "Trieste",
    message_count: "124",
    path: "/area489"
  },
  {
    id: 62,
    name: "roma",
    displayName: "Roma",
    message_count: "82",
    path: "/area62"
  },
  {
    id: 640,
    name: "el_barcelon%C3%A8s",
    displayName: "Barcelona",
    message_count: "76",
    path: "/area640"
  },
  {
    id: 596,
    name: "cuenca",
    displayName: "Cuenca",
    message_count: "72",
    path: "/area596"
  }
]; 

export const AREAS: Area[] = [
  {
    id: 693,
    name: "municipality_of_valencia",
    displayName: "Valencia",
    message_count: "285",
    path: "/area693"
  },
  {
    id: 640,
    name: "el_barcelon%C3%A8s",
    displayName: "Barcelona",
    message_count: "76",
    path: "/area640"
  },
];


export const RECORDINGS: Message[] = [
{
  id: "rec1",
  visible: "1",
  dateTime: "2024-01-15T10:30:00",
  text: "Description of location 1",
  text_visible: "1", 
  latitude: "41.385063",
  longitude: "2.182771",
  address: "Carrer de Montcada, 15-23, 08003 Barcelona, Spain",
  authorUser: {
    id: "user123",
    username: "johndoe",
    displayName: "John Doe",
    preferredLanguage: {
      id: "1",
      code: "en",
      name: "English",
      extended_code: "en_US",
      visible: "1"
    },
    currentArea: {
      id: 640,
      name: "el_barcelon%C3%A8s",
      displayName: "Barcelona",
      message_count: "76",
      path: "/area640"
    },
    activation_status: "active"
  },
  tags: [
    {id: "0", name: "tomàquet", asString: "tomàquet"},
    {id: "1", name: "ceba", asString: "ceba"},
    {id: "2", name: "olives", asString: "olives"}
  ],
  comments: []
},
{
  id: "rec2",
  visible: "1",
  dateTime: "2024-01-15T11:30:00", 
  text: "Description of location 2",
  text_visible: "1",
  latitude: "40.420523",
  longitude: "-3.711889",
  address: "Calle de la Princesa, 1, 28008 Madrid, Spain",
  authorUser: {
    id: "user456",
    username: "johndoe2",
    displayName: "John Doe",
    preferredLanguage: {
      id: "1", 
      code: "en",
      name: "English",
      extended_code: "en_US",
      visible: "1"
    },
    currentArea: {
      id: 693,
      name: "municipality_of_valencia",
      displayName: "Valencia",
      message_count: "285",
      path: "/area693"
    },
    activation_status: "active"
  },
  tags: [
    {id: "3", name: "picaporte", asString: "picaporte"},
    {id: "4", name: "banco", asString: "banco"}, 
    {id: "5", name: "carretera", asString: "carretera"}
  ],
  comments: [
    {
      id: "1",
      text: "Great place to visit!",
      dateTime: "2024-01-15T11:35:00",
      authorUser: {
        id: "user111",
        username: "commenter1",
        displayName: "Comment User",
        preferredLanguage: {
          id: "1",
          code: "en", 
          name: "English",
          extended_code: "en_US",
          visible: "1"
        },
        currentArea: {
          id: 693,
          name: "municipality_of_valencia",
          displayName: "Valencia",
          message_count: "285",
          path: "/area693"
        },
        activation_status: "active"
      },
      audio_url: null,
      visible: "1"
    },
    {
      id: "2", 
      text: "Very accessible entrance.",
      dateTime: "2024-01-15T11:40:00",
      authorUser: {
        id: "user222",
        username: "commenter2",
        displayName: "Comment User 2",
        preferredLanguage: {
          id: "1",
          code: "en",
          name: "English",
          extended_code: "en_US",
          visible: "1"
        },
        currentArea: {
          id: 693,
          name: "municipality_of_valencia",
          displayName: "Valencia",
          message_count: "285",
          path: "/area693"
        },
        activation_status: "active"
      },
      audio_url: null,
      visible: "1"
    }
  ]
},
{
  id: "rec3",
  visible: "1",
  dateTime: "2024-01-15T12:30:00",
  text: "Description of location 3", 
  text_visible: "1",
  latitude: "41.389411",
  longitude: "2.136849",
  address: "Avinguda Diagonal, 661-671, 08028 Barcelona, Spain",
  authorUser: {
    id: "user789",
    username: "johndoe3",
    displayName: "John Doe",
    preferredLanguage: {
      id: "1",
      code: "en",
      name: "English",
      extended_code: "en_US",
      visible: "1"
    },
    currentArea: {
      id: 640,
      name: "el_barcelon%C3%A8s",
      displayName: "Barcelona",
      message_count: "76",
      path: "/area640"
    },
    activation_status: "active"
  },
  tags: [
    {id: "6", name: "critical", asString: "critical"},
    {id: "7", name: "eccentric", asString: "eccentric"},
    {id: "8", name: "dangerous", asString: "dangerous"},
    {id: "9", name: "accessible", asString: "accessible"}
  ],
  comments: [
    {
      id: "3",
      text: "Merci per la info",
      dateTime: "2024-01-15T12:35:00",
      authorUser: {
        id: "user333",
        username: "commenter3",
        displayName: "Comment User 3",
        preferredLanguage: {
          id: "2",
          code: "fr",
          name: "French",
          extended_code: "fr_FR",
          visible: "1"
        },
        currentArea: {
          id: 640,
          name: "el_barcelon%C3%A8s",
          displayName: "Barcelona",
          message_count: "76",
          path: "/area640"
        },
        activation_status: "active"
      },
      audio_url: null,
      visible: "1"
    }
  ]
}
];

export const TAGS: Tag[] = [
  {id: "0", name: "tomàquet", asString: "tomàquet"},
  {id: "1", name: "ceba", asString: "ceba"},
  {id: "2", name: "olives", asString: "olives"},
  {id: "3", name: "picaporte", asString: "picaporte"},
  {id: "4", name: "banco", asString: "banco"},
  {id: "5", name: "carretera", asString: "carretera"},
  {id: "6", name: "critical", asString: "critical"},
  {id: "7", name: "eccentric", asString: "eccentric"},
  {id: "8", name: "dangerous", asString: "dangerous"},
  {id: "9", name: "accessible", asString: "accessible"}
]