export default interface Recording {
  id: string;
  tags: number[];
  user: {
    id: string;
    name: string;
  };
  location: string;
  comments: string[];
  audioFileId: string;
}
