import { t } from "i18next";
import { Message } from "@/models/message";
import { Tag } from "@/models/tag";
import Language from "@/models/language";

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
      id: "1",
      name: "Barcelona"
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
      id: "2",
      name: "Madrid"
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
          id: "2",
          name: "Madrid"
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
          id: "2", 
          name: "Madrid"
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
      id: "1",
      name: "Barcelona"
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
          id: "1",
          name: "Barcelona"
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