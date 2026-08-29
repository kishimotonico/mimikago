import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Work } from "@mimimilli/shared";
import { emptyDlsiteState } from "@mimimilli/shared";
import { WORK_SOURCE_PATCH_BLOCKED_MESSAGE } from "../../src/entities/work/sourceRevision";
import type { LibraryTitlePatchMutation } from "../../src/features/library/model/useLibraryQueries";
import { WorkEditDialog } from "../../src/features/library/ui/preview/WorkEditDialog";

vi.mock("../../src/features/library/ui/preview/WorkTagEditor", () => ({
  WorkTagEditor: () => <div data-testid="tag-editor" />,
}));
vi.mock("../../src/features/library/ui/preview/DlsiteEditor", () => ({
  DlsiteEditor: () => null,
}));

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

function makeWork(overrides: Partial<Work> = {}): Work {
  return {
    id: "w1",
    title: "作品",
    cover: null,
    coverKind: "none",
    coverImage: null,
    status: "ok",
    physicalPath: "/lib/w1",
    totalDurationSec: 120,
    addedAt: "2025-01-01T00:00:00.000Z",
    errorMessage: null,
    urls: [],
    tags: [],
    bookmarked: false,
    lastPlayedAt: null,
    dlsite: emptyDlsiteState(),
    defaultPlaylistId: null,
    createdAt: null,
    playlists: [],
    resume: null,
    sourceRevision: "revision-1",
    ...overrides,
  };
}

function makeTitleMutation(
  overrides: Partial<LibraryTitlePatchMutation> = {},
): LibraryTitlePatchMutation {
  return {
    isPending: false,
    error: null,
    reset: vi.fn(),
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    ...overrides,
  } as LibraryTitlePatchMutation;
}

describe("WorkEditDialog", () => {
  it("sourceRevision未設定時はタイトル保存を実行せず理由を表示する", () => {
    const mutate = vi.fn();
    render(
      <WorkEditDialog
        work={makeWork({ sourceRevision: undefined })}
        tagSuggestions={[]}
        workPatchMutations={{
          titleMutation: makeTitleMutation({ mutate }),
          tagsMutation: { mutateAsync: vi.fn() } as never,
          urlsMutation: { mutate: vi.fn(), isPending: false, error: null } as never,
        }}
        onClose={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("タイトル");
    expect(input).toBeDisabled();
    fireEvent.change(input, { target: { value: "新しいタイトル" } });
    fireEvent.click(screen.getByRole("button", { name: "タイトルを保存" }));
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(WORK_SOURCE_PATCH_BLOCKED_MESSAGE);
  });

  it("javascript: のURLは保存せずバリデーション文言を出す", () => {
    const mutate = vi.fn();
    render(
      <WorkEditDialog
        work={makeWork()}
        tagSuggestions={[]}
        workPatchMutations={{
          titleMutation: makeTitleMutation(),
          tagsMutation: { mutateAsync: vi.fn() } as never,
          urlsMutation: { mutate, isPending: false, error: null } as never,
        }}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "URLを追加" }));
    fireEvent.change(screen.getByLabelText("URLラベル 1"), { target: { value: "公式" } });
    fireEvent.change(screen.getByLabelText("URL 1"), { target: { value: "javascript:alert(1)" } });
    fireEvent.click(screen.getByRole("button", { name: "関連URLを保存" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("httpまたはhttpsのURLだけを登録できます");
  });

  it("http(s)のURLを保存できる", () => {
    const mutate = vi.fn();
    render(
      <WorkEditDialog
        work={makeWork()}
        tagSuggestions={[]}
        workPatchMutations={{
          titleMutation: makeTitleMutation(),
          tagsMutation: { mutateAsync: vi.fn() } as never,
          urlsMutation: { mutate, isPending: false, error: null } as never,
        }}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "URLを追加" }));
    fireEvent.change(screen.getByLabelText("URLラベル 1"), { target: { value: "公式" } });
    fireEvent.change(screen.getByLabelText("URL 1"), {
      target: { value: "https://example.com/work" },
    });
    fireEvent.click(screen.getByRole("button", { name: "関連URLを保存" }));

    expect(mutate).toHaveBeenCalledWith({
      workId: "w1",
      sourceRevision: "revision-1",
      urls: [{ label: "公式", url: "https://example.com/work" }],
    });
  });
});
