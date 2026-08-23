import { useTransition } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import Breadcrumbs from "../../../shared/ui/Breadcrumbs";
import { buildLibraryAddressPath } from "../model/atoms";
import { activeAxisAtom } from "../../../entities/library/model/navigationAtoms";
import { goToLibrarySegmentAtom } from "../../../entities/library/model/navigationActions";
import { useTagPrefixes } from "../../../entities/tag/useTagPrefixes";

export default function LibraryBreadcrumbs() {
  const activeAxis = useAtomValue(activeAxisAtom);
  const { tagPrefixes } = useTagPrefixes();
  const path = buildLibraryAddressPath(activeAxis, tagPrefixes);
  const goToSegmentAtom = useSetAtom(goToLibrarySegmentAtom);
  const [, startTransition] = useTransition();
  const goToSegment = (index: number) => startTransition(() => goToSegmentAtom(index));

  return <Breadcrumbs path={path} onNavigate={goToSegment} />;
}
