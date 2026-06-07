'use client';

import { useCallback } from 'react';
import {
  ZoomIn, ZoomOut, Maximize2,
  Grid3X3, Map, Save, Share2,
  Download, Keyboard, Play, Pause, RotateCcw,
  Plus,
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { BackButton } from '@/components/ui/back-button';
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider
} from '@/components/ui/tooltip';
import { useCanvasStore } from '@/store/canvas-store';
import { useSimulationStore } from '@/store/simulation-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { getModifierKey } from '@/lib/utils';

interface CanvasToolbarProps {
  projectTitle: string;
  isSaving?: boolean;
  onSave?: () => void;
  onAddNeuron?: (type: 'input' | 'hidden' | 'output') => void;
}

function ToolbarButton({
  icon: Icon,
  label,
  shortcut,
  onClick,
  active,
  disabled,
  variant = 'ghost',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  variant?: 'ghost' | 'default';
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? 'default' : 'ghost'}
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
          className={cn(active && 'bg-primary text-primary-foreground')}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function CanvasToolbar({
  projectTitle,
  isSaving,
  onSave,
  onAddNeuron,
}: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { settings, updateSettings, isDirty } = useCanvasStore();
  const { isRunning, setRunning, reset: resetSimulation } = useSimulationStore();
  const { setShortcutsModal, setShareModal, setExportModal } = useUIStore();

  const mod = getModifierKey();

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.1, duration: 400 });
  }, [fitView]);

  const toggleGrid = useCallback(() => {
    updateSettings({ gridVisible: !settings.gridVisible });
  }, [settings.gridVisible, updateSettings]);

  const toggleMinimap = useCallback(() => {
    updateSettings({ showMinimap: !settings.showMinimap });
  }, [settings.showMinimap, updateSettings]);

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="nnn-canvas-toolbar-back"
      >
        <BackButton href="/dashboard" label="Dashboard" />
      </motion.div>

      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="nnn-canvas-toolbar"
      >
        {/* Project title */}
        <span className="nnn-canvas-toolbar-title">
          {projectTitle}
        </span>
        {isDirty && (
          <div className="nnn-canvas-toolbar-dirty" title="Unsaved changes" />
        )}

        <Separator orientation="vertical" className="nnn-canvas-toolbar-separator" />

        {/* Add neurons */}
        <div className="nnn-canvas-toolbar-group">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onAddNeuron?.('input')}
                className="nnn-canvas-toolbar-btn-input"
                aria-label="Add input neuron"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Add Input Neuron</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onAddNeuron?.('hidden')}
                className="nnn-canvas-toolbar-btn-hidden"
                aria-label="Add hidden neuron"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Add Hidden Neuron</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onAddNeuron?.('output')}
                className="nnn-canvas-toolbar-btn-output"
                aria-label="Add output neuron"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Add Output Neuron</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="nnn-canvas-toolbar-separator" />

        {/* View controls */}
        <div className="nnn-canvas-toolbar-group">
          <ToolbarButton
            icon={ZoomIn}
            label="Zoom In"
            shortcut={`${mod} +`}
            onClick={() => zoomIn({ duration: 200 })}
          />
          <ToolbarButton
            icon={ZoomOut}
            label="Zoom Out"
            shortcut={`${mod} -`}
            onClick={() => zoomOut({ duration: 200 })}
          />
          <ToolbarButton
            icon={Maximize2}
            label="Fit View"
            shortcut="F"
            onClick={handleFitView}
          />
          <ToolbarButton
            icon={Grid3X3}
            label={settings.gridVisible ? 'Hide Grid' : 'Show Grid'}
            onClick={toggleGrid}
            active={settings.gridVisible}
          />
          <ToolbarButton
            icon={Map}
            label={settings.showMinimap ? 'Hide Minimap' : 'Show Minimap'}
            onClick={toggleMinimap}
            active={settings.showMinimap}
          />
        </div>

        <Separator orientation="vertical" className="nnn-canvas-toolbar-separator" />

        {/* Simulation */}
        <div className="nnn-canvas-toolbar-group">
          <ToolbarButton
            icon={isRunning ? Pause : Play}
            label={isRunning ? 'Pause' : 'Run Simulation'}
            onClick={() => setRunning(!isRunning)}
            active={isRunning}
          />
          <ToolbarButton
            icon={RotateCcw}
            label="Reset Simulation"
            onClick={resetSimulation}
          />
        </div>

        <Separator orientation="vertical" className="nnn-canvas-toolbar-separator" />

        {/* Actions */}
        <div className="nnn-canvas-toolbar-group">
          <ToolbarButton
            icon={Save}
            label="Save"
            shortcut={`${mod} S`}
            onClick={onSave}
            disabled={isSaving}
          />
          <ToolbarButton
            icon={Share2}
            label="Share"
            onClick={() => setShareModal(true)}
          />
          <ToolbarButton
            icon={Download}
            label="Export"
            onClick={() => setExportModal(true)}
          />
          <ToolbarButton
            icon={Keyboard}
            label="Keyboard Shortcuts"
            shortcut="?"
            onClick={() => setShortcutsModal(true)}
          />
        </div>

        <Separator orientation="vertical" className="nnn-canvas-toolbar-separator" />

        <ThemeToggle size="sm" />
      </motion.div>
    </TooltipProvider>
  );
}
