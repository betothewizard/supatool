import { initFocusAntiDetectEngine } from '../features/focus-anti-detect/engine';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  world: 'MAIN',
  allFrames: true,
  matchOriginAsFallback: true,
  main() {
    initFocusAntiDetectEngine();
  },
});
