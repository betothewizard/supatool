import { useState } from 'react';
import { browser } from 'wxt/browser';
import { Card, CardContent, Typography, Button, FormControlLabel, Checkbox, Stack, Box, CircularProgress } from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

interface ClearSiteDataCardProps {
  currentOrigin: string | null;
  activeTabId?: number;
  onStatusChange?: (status: { type: 'success' | 'error' | 'info'; msg: string } | null) => void;
}

export function ClearSiteDataCard({ currentOrigin, activeTabId, onStatusChange }: ClearSiteDataCardProps) {
  const [autoReload, setAutoReload] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleClearData = async () => {
    if (!currentOrigin) {
      onStatusChange?.({ type: 'error', msg: 'No active web page detected' });
      return;
    }

    setLoading(true);
    onStatusChange?.(null);

    try {
      await browser.browsingData.remove(
        { origins: [currentOrigin] },
        {
          cache: true,
          cookies: true,
          fileSystems: true,
          indexedDB: true,
          localStorage: true,
          serviceWorkers: true,
        }
      );

      onStatusChange?.({
        type: 'success',
        msg: `Cleared site data for ${currentOrigin}!`,
      });

      if (autoReload && activeTabId) {
        await browser.tabs.reload(activeTabId);
      }
    } catch (err) {
      console.error('Error clearing site data:', err);
      onStatusChange?.({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to clear site data',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <DeleteSweepIcon color="error" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Clear Site Data
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Box
            sx={{
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem' }}>
              TARGET ORIGIN
            </Typography>
            <Typography
              variant="body2"
              color={currentOrigin ? 'primary.main' : 'text.disabled'}
              sx={{
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentOrigin || 'No web page open'}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="error"
            onClick={handleClearData}
            disabled={loading || !currentOrigin}
            fullWidth
            size="small"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {loading ? 'Clearing...' : 'Clear Cache & Storage'}
          </Button>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={autoReload}
                onChange={(e) => setAutoReload(e.target.checked)}
                color="error"
              />
            }
            label={
              <Typography variant="caption" color="text.secondary">
                Auto reload tab after clearing
              </Typography>
            }
            sx={{ ml: -0.5, my: -0.5 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
