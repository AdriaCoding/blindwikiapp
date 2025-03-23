import Area from "./area";
import Language from "./language";

export default interface User {
  id: string;
  username: string;
  displayName: string;
  preferredLanguage: Language;
  currentArea: Area;
  activation_status: string
}