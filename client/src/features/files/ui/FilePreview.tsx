import { useCallback, useState } from "react";
import { useSetAtom } from "jotai";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToastAtom } from "../../../shared/model/errorToastAtom";
import { I } from "../../../shared/ui/Icon";
import Button from "../../../shared/ui/Button";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import { WORK_QUERY_KEYS } from "../../../entities/work/queryKeys";
import { SCAN_QUERY_KEYS } from "../../../entities/scan/queryKeys";
import { FILE_SYSTEM_QUERY_KEYS } from "../../../entities/file-system/queryKeys";
import { getWorkRegisterPreview, reassignIdentityConflict } from "../api";
import { deleteWork } from "../../../entities/work/api";
import RegisterWorkDialog from "./RegisterWorkDialog";
import { Hero, WorkspaceMedia } from "./FilePreviewMedia";
import type { ScanDiagnostic, WorkRegisterPreview, WorkspacePath } from "@mimimilli/shared";
import { classifyFile, summarizeKinds, FILE_KIND_LABEL, type FsEntry } from "../model/types";
import { apiErrorMessage } from "../../../shared/lib/apiError";

interface FilePreviewProps {
  /** 選択中エントリ（ファイル or dir）。null ならプレビューなし */
  entry: FsEntry | null;
  /** entry が dir のときその直下エントリ（種別内訳・全wav再生に使用） */
  folderEntries: FsEntry[] | null;
  /** 物理階層の深さ（パンくず段数） */
  depth: number;
  /** 現在開いているディレクトリ（FS キャッシュ無効化用） */
  browsePath: string;
  isPlayingEntry: boolean;
  onPlay: (entry: FsEntry) => void;
  /** 作品登録・解除後にファイル一覧を再取得する */
  onWorkRegistered?: () => void | Promise<unknown>;
  identityConflict: ScanDiagnostic | null;
}

export default function FilePreview({
  entry,
  folderEntries,
  depth,
  browsePath,
  isPlayingEntry,
  onPlay,
  onWorkRegistered,
  identityConflict,
}: FilePreviewProps) {
  const queryClient = useQueryClient();
  const setErrorToast = useSetAtom(errorToastAtom);
  const [registerPreview, setRegisterPreview] = useState<WorkRegisterPreview | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showUnregisterConfirm, setShowUnregisterConfirm] = useState(false);
  const [showReassignConfirm, setShowReassignConfirm] = useState(false);

  const refreshFsState = useCallback(async () => {
    const paths = new Set<string>();
    if (entry) paths.add(entry.path);
    if (browsePath) paths.add(browsePath);
    await Promise.all(
      [...paths].map((path) =>
        queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_QUERY_KEYS.directory(path) }),
      ),
    );
    await queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_QUERY_KEYS.all() });
    await queryClient.invalidateQueries({ queryKey: SCAN_QUERY_KEYS.diagnostics() });
    await queryClient.invalidateQueries({ queryKey: WORK_QUERY_KEYS.all() });
    await onWorkRegistered?.();
  }, [browsePath, entry, onWorkRegistered, queryClient]);

  const unregisterMutation = useMutation({
    mutationFn: (workId: string) => deleteWork(workId),
    onSuccess: async () => {
      setShowUnregisterConfirm(false);
      await refreshFsState();
    },
    onError: (cause) => {
      setErrorToast(apiErrorMessage(cause, "作品登録の解除に失敗しました"));
    },
  });

  const reassignMutation = useMutation({
    mutationFn: (path: WorkspacePath) => reassignIdentityConflict(path),
    onSuccess: async () => {
      setShowReassignConfirm(false);
      await refreshFsState();
    },
    onError: (cause) => {
      setErrorToast(apiErrorMessage(cause, "別作品としての取り込みに失敗しました"));
    },
  });

  const registerPreviewMutation = useMutation({
    mutationFn: (path: WorkspacePath) => getWorkRegisterPreview(path),
    onSuccess: async (preview) => {
      if (preview.alreadyRegistered) {
        setErrorToast("このフォルダーは既に作品として登録されています");
        await refreshFsState();
        return;
      }
      setRegisterPreview(preview);
      setShowRegisterDialog(true);
    },
    onError: (cause) => {
      setErrorToast(apiErrorMessage(cause, "登録情報の取得に失敗しました"));
    },
  });

  const kind = entry ? classifyFile(entry) : null;
  const isDir = kind === "dir";
  const label = isDir
    ? "フォルダー · 物理"
    : kind
      ? `${FILE_KIND_LABEL[kind]} · 物理`
      : "プレビュー";
  const audioFiles = isDir ? (folderEntries ?? []).filter((e) => classifyFile(e) === "audio") : [];
  const firstAudioFile = audioFiles[0];
  const breakdown = isDir && folderEntries ? summarizeKinds(folderEntries) : [];
  const isWorkFolder = isDir && !!entry?.workId;
  const canRegisterFolder = isDir && entry && !entry.workId;

  const playActions =
    kind === "audio" ? (
      <Button
        variant="primary"
        icon={isPlayingEntry ? I.audio : I.play}
        onClick={() => onPlay(entry!)}
      >
        {isPlayingEntry ? "再生中" : "このファイルを再生"}
      </Button>
    ) : isDir && firstAudioFile ? (
      <Button variant="primary" icon={I.play} onClick={() => onPlay(firstAudioFile)}>
        先頭の音声を再生
      </Button>
    ) : null;

  const workActions = canRegisterFolder ? (
    <Button
      variant="primary"
      icon={I.add}
      disabled={registerPreviewMutation.isPending}
      onClick={() => {
        setErrorToast(null);
        if (entry) registerPreviewMutation.mutate(entry.path);
      }}
    >
      このフォルダーを作品として登録
    </Button>
  ) : isWorkFolder && entry?.workId ? (
    <Button
      variant="ghost"
      disabled={unregisterMutation.isPending}
      onClick={() => {
        setErrorToast(null);
        setShowUnregisterConfirm(true);
      }}
    >
      作品登録を解除
    </Button>
  ) : null;

  const hasActions = playActions != null || workActions != null;
  const conflictingPaths = identityConflict?.paths.filter((path) => path !== entry?.path) ?? [];

  return (
    <div className="mle-prv is-files">
      <div className="mle-prv__hd">
        <span className="label">{label}</span>
        {entry && (
          <span className="pill" style={{ marginLeft: "auto" }}>
            {isDir ? `深さ ${depth} 階層` : kind?.toUpperCase()}
          </span>
        )}
      </div>

      <div className="mle-prv__body">
        {!entry ? (
          <EmptyPreview />
        ) : (
          <div className="mle-fprev">
            {!isDir && entry.preview && entry.mediaKind ? (
              <WorkspaceMedia entry={entry} />
            ) : (
              <Hero
                kind={kind!}
                entry={entry}
                isWorkFolder={isWorkFolder}
                breakdown={isDir ? breakdown : undefined}
              />
            )}

            {hasActions && (
              <div className="mle-fprev__actions">
                {playActions}
                {workActions}
              </div>
            )}
            {identityConflict && entry?.isDir && (
              <section className="mle-identity-conflict" aria-label="ID重複">
                <span className="mle-identity-conflict-badge">ID重複</span>
                <p>同じWork IDを持つフォルダーがあります。</p>
                <div className="mle-identity-conflict__paths">
                  {conflictingPaths.map((path) => (
                    <code key={path}>{path}</code>
                  ))}
                </div>
                <Button
                  variant="primary"
                  disabled={reassignMutation.isPending}
                  onClick={() => setShowReassignConfirm(true)}
                >
                  別作品として取り込む
                </Button>
              </section>
            )}
          </div>
        )}
      </div>

      {showRegisterDialog && registerPreview && entry && (
        <RegisterWorkDialog
          folderPath={entry.path}
          preview={registerPreview}
          onRegistered={refreshFsState}
          onClose={() => {
            setShowRegisterDialog(false);
            setRegisterPreview(null);
          }}
        />
      )}

      {showUnregisterConfirm && (
        <ConfirmDialog
          title="作品登録を解除"
          message="このフォルダーの作品データ（再生履歴・タグを含む）と管理ファイル（mimimilli.json）を削除します。音声などの物理ファイルは削除されません。"
          confirmLabel="解除する"
          onConfirm={() => {
            if (entry?.workId) unregisterMutation.mutate(entry.workId);
          }}
          onCancel={() => setShowUnregisterConfirm(false)}
        />
      )}

      {showReassignConfirm && entry && (
        <ConfirmDialog
          title="別作品として取り込む"
          message={`「${entry.path}」のWork IDを新しくして、別作品として取り込みます。再生履歴やタグなどのユーザー状態は引き継ぎません。`}
          confirmLabel="取り込む"
          onConfirm={() => reassignMutation.mutate(entry.path)}
          onCancel={() => setShowReassignConfirm(false)}
        />
      )}
    </div>
  );
}

function EmptyPreview() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        color: "var(--ink-4)",
        minHeight: 240,
      }}
    >
      <I.folderO size={28} />
      <span style={{ fontSize: 12 }}>フォルダーまたはファイルを選択してください</span>
    </div>
  );
}
