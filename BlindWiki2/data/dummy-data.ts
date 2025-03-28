import { t } from "i18next";

export const RECORDINGS = [
{
  id: "rec1",
  tags: [0, 1, 2],
  user: {
    id: "user123",
    name: "John Doe",
  },
  location: "Carrer de Montcada, 15-23, 08003 Barcelona, Spain",
  comments: [],
  audioFileId: "audio_1",
},
{
  id: "rec2",
  tags: [3, 4, 5],
  user: {
    id: "user456",
    name: "John Doe",
  },
  location: "Calle de la Princesa, 1, 28008 Madrid, Spain",
  comments: ["Great place to visit!", "Very accessible entrance."],
  audioFileId: "audio_2",
},
{
  id: "rec3",
  tags: [6, 7, 8, 9],
  user: {
    id: "user789",
    name: "John Doe",
  },
  location: "Avinguda Diagonal, 661-671, 08028 Barcelona, Spain",
  comments: ["Merci per la info"],
  audioFileId: "audio_3",
},
];

export const TAGS = [
  {id: 0, name: "tomàquet"},
  {id: 1, name: "ceba"},
  {id: 2, name: "olives"},
  {id: 3, name: "picaporte"},
  {id: 4, name: "banco"},
  {id: 5, name: "carretera"},
  {id: 6, name: "critical"},
  {id: 7, name: "eccentric"},
  {id: 8, name: "dangerous"},
  {id: 9, name: "accessible"}
]