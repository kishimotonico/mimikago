import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import * as api from '../api';

const mockedInvoke = vi.mocked(invoke);

describe('api', () => {
  beforeEach(() => {
    mockedInvoke.mockReset();
  });

  it('getRootFolder calls invoke correctly', async () => {
    mockedInvoke.mockResolvedValue('/test/path');
    const result = await api.getRootFolder();
    expect(mockedInvoke).toHaveBeenCalledWith('get_root_folder');
    expect(result).toBe('/test/path');
  });

  it('setRootFolder calls invoke with path', async () => {
    mockedInvoke.mockResolvedValue(undefined);
    await api.setRootFolder('/new/path');
    expect(mockedInvoke).toHaveBeenCalledWith('set_root_folder', { path: '/new/path' });
  });

  it('scanLibrary calls invoke', async () => {
    const mockResult = { registered: 5, newlyGenerated: 2, errors: 0, missing: 0, newWorkIds: [] };
    mockedInvoke.mockResolvedValue(mockResult);
    const result = await api.scanLibrary();
    expect(mockedInvoke).toHaveBeenCalledWith('scan_library');
    expect(result).toEqual(mockResult);
  });

  it('searchWorks passes query and tagFilters', async () => {
    mockedInvoke.mockResolvedValue([]);
    await api.searchWorks('test', ['ASMR']);
    expect(mockedInvoke).toHaveBeenCalledWith('search_works', { query: 'test', tagFilters: ['ASMR'] });
  });

  it('updateWorkTags passes workId and tags', async () => {
    mockedInvoke.mockResolvedValue(undefined);
    await api.updateWorkTags('work-1', ['tag1', 'tag2']);
    expect(mockedInvoke).toHaveBeenCalledWith('update_work_tags', { workId: 'work-1', tags: ['tag1', 'tag2'] });
  });

  it('toggleBookmark passes workId', async () => {
    mockedInvoke.mockResolvedValue(true);
    const result = await api.toggleBookmark('work-1');
    expect(mockedInvoke).toHaveBeenCalledWith('toggle_bookmark', { workId: 'work-1' });
    expect(result).toBe(true);
  });

  it('saveResumePosition passes all params', async () => {
    mockedInvoke.mockResolvedValue(undefined);
    await api.saveResumePosition('work-1', 42.5, 2);
    expect(mockedInvoke).toHaveBeenCalledWith('save_resume_position', { workId: 'work-1', position: 42.5, trackIndex: 2 });
  });

  it('saveSearchPreset passes all params', async () => {
    mockedInvoke.mockResolvedValue(1);
    const result = await api.saveSearchPreset('preset1', 'query', ['tag'], 'added-desc');
    expect(mockedInvoke).toHaveBeenCalledWith('save_search_preset', { name: 'preset1', query: 'query', tagFilters: ['tag'], sortId: 'added-desc' });
    expect(result).toBe(1);
  });

  it('exportLibrary calls invoke', async () => {
    mockedInvoke.mockResolvedValue('{"version":1}');
    const result = await api.exportLibrary();
    expect(result).toBe('{"version":1}');
  });

  it('fetchDlsiteInfo passes workId', async () => {
    const mockInfo = { rjCode: 'RJ123456', title: 'test', circle: null, cvs: [], genreTags: [], coverUrl: null, url: '' };
    mockedInvoke.mockResolvedValue(mockInfo);
    const result = await api.fetchDlsiteInfo('work-1');
    expect(mockedInvoke).toHaveBeenCalledWith('fetch_dlsite_info', { workId: 'work-1' });
    expect(result).toEqual(mockInfo);
  });
});
