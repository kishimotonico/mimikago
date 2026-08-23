import type { DlsiteNotificationModalKind } from "../../features/dlsite/model/dlsiteNotificationModal";
import { isDlsiteNotificationModal } from "../../features/dlsite/model/dlsiteNotificationModal";

export type ActiveModal = null | "settings" | "scan" | DlsiteNotificationModalKind;

export { isDlsiteNotificationModal };
