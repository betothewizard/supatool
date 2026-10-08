import { useState, useEffect } from 'react';
import { Container, Typography, Stack, Snackbar, Alert, Paper } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { getActiveTabInfo, type ActiveTabInfo } from '../../utils/active-tab';
import { FocusAntiDetectCard } from '../../features/focus-anti-detect/FocusAntiDetectCard';
import { ClearSiteDataCard } from '../../features/clear-site-data/ClearSiteDataCard';

export default function App() {
  const [tabInfo, setTabInfo] = useState<ActiveTabInfo>({ origin: null, hostname: null });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

  useEffect(() => {
    async function init() {
      const info = await getActiveTabInfo();
      setTabInfo(info);
    }
    init();
  }, []);

  return (
    <Container disableGutters sx={{ p: 2, width: 360, minWidth: 360, boxSizing: 'border-box' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pb: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Paper elevation={0} sx={{ p: 0.5, bgcolor: 'action.hover', borderRadius: 1, display: 'flex' }}>
            <FlashOnIcon color="primary" fontSize="small" />
          </Paper>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            Supatool
          </Typography>
        </Stack>

        <FocusAntiDetectCard
          activeTabId={tabInfo.tabId}
          currentDomain={tabInfo.hostname}
          currentUrl={tabInfo.url}
        />

        <ClearSiteDataCard
          currentOrigin={tabInfo.origin}
          activeTabId={tabInfo.tabId}
          onStatusChange={setStatus}
        />

        <Snackbar
          open={Boolean(status)}
          autoHideDuration={4000}
          onClose={() => setStatus(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {status ? (
            <Alert onClose={() => setStatus(null)} severity={status.type} sx={{ width: '100%' }}>
              {status.msg}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Stack>
    </Container>
  );
}
