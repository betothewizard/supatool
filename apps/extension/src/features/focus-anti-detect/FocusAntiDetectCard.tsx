import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Switch, Stack, Chip, Box, Button, FormControlLabel, Checkbox } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  queryFocusStatus,
  toggleTabFocus,
  toggleDomainFocus,
  toggleGlobalFocus,
  reloadActiveTab,
} from './storage';

interface FocusAntiDetectCardProps {
  activeTabId?: number;
  currentDomain: string | null;
  currentUrl?: string;
}

export function FocusAntiDetectCard({ activeTabId, currentDomain, currentUrl }: FocusAntiDetectCardProps) {
  const [isTabEnabled, setIsTabEnabled] = useState<boolean>(false);
  const [isAlwaysOn, setIsAlwaysOn] = useState<boolean>(false);
  const [isGlobal, setIsGlobal] = useState<boolean>(false);
  const [isSpoofingActive, setIsSpoofingActive] = useState<boolean>(false);
  const [autoReload, setAutoReload] = useState<boolean>(false);

  const loadStatus = async () => {
    const res = await queryFocusStatus(activeTabId, currentUrl);
    if (res) {
      setIsSpoofingActive(res.isSpoofing);
      setIsAlwaysOn(res.isAlwaysOn);
      setIsGlobal(res.isGlobal);
      setIsTabEnabled(res.isTabEnabled);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [activeTabId, currentUrl]);

  const handleToggleTab = async () => {
    if (!activeTabId) return;
    try {
      await toggleTabFocus(activeTabId, autoReload);
      await loadStatus();
    } catch (err) {
      console.error('Error toggling tab focus:', err);
    }
  };

  const handleToggleDomain = async () => {
    if (!currentDomain) return;
    try {
      await toggleDomainFocus(currentDomain, activeTabId, autoReload);
      await loadStatus();
    } catch (err) {
      console.error('Error toggling domain focus:', err);
    }
  };

  const handleToggleGlobal = async () => {
    try {
      await toggleGlobalFocus(activeTabId, autoReload);
      await loadStatus();
    } catch (err) {
      console.error('Error toggling global focus:', err);
    }
  };

  const handleReload = async () => {
    if (!activeTabId) return;
    await reloadActiveTab(activeTabId);
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <VisibilityIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Tab Keep-Alive (Focus Emulation)
            </Typography>
          </Stack>
          <Chip
            label={isSpoofingActive ? 'ACTIVE' : 'OFF'}
            color={isSpoofingActive ? 'success' : 'default'}
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
          />
        </Stack>

        <Stack spacing={1}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Active Tab Keep-Alive
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Emulates focus & prevents background throttling
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={isTabEnabled}
              onChange={handleToggleTab}
              disabled={!activeTabId}
            />
          </Stack>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Always Active on Domain
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentDomain ? `Auto keep-alive on ${currentDomain}` : 'Web domain required'}
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={isAlwaysOn}
              onChange={handleToggleDomain}
              disabled={!currentDomain}
            />
          </Stack>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Global Master Mode
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Emulate focus across all browser tabs
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={isGlobal}
              onChange={handleToggleGlobal}
            />
          </Stack>

          <Box sx={{ pt: 0.5, borderTop: 1, borderColor: 'divider', mt: 0.5 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={autoReload}
                    onChange={(e) => setAutoReload(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="caption" color="text.secondary">
                    Auto-reload tab on toggle
                  </Typography>
                }
                sx={{ ml: -0.5 }}
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon fontSize="small" />}
                onClick={handleReload}
                disabled={!activeTabId}
                sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.2 }}
              >
                Reload Tab
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
