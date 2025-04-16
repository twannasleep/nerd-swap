import { rem } from '@mantine/core';
import type { MantineThemeComponents } from '@mantine/core';

// Global component presets with compact sizing by default
export const components: MantineThemeComponents = {
  Paper: {
    defaultProps: {
      bg: 'dark.8',
      radius: 'sm',
      p: 'xs',
    },
  },

  Button: {
    defaultProps: {
      size: 'sm',
      radius: 'sm',
    },
    styles: () => ({
      root: {
        fontWeight: 500,
        '&:hover': {
          transform: 'translateY(-1px)',
          transition: 'transform 150ms ease',
        },
      },
    }),
  },

  ActionIcon: {
    defaultProps: {
      size: 'sm',
      variant: 'subtle',
    },
    styles: () => ({
      root: {
        '&:hover': {
          transform: 'scale(1.05)',
          transition: 'transform 150ms ease',
        },
      },
    }),
  },

  Card: {
    defaultProps: {
      p: 'xs',
      radius: 'sm',
      withBorder: false,
      bg: 'dark.7',
    },
  },

  Menu: {
    defaultProps: {
      radius: 'sm',
      size: 'xs',
    },
    styles: {
      dropdown: {
        backgroundColor: 'var(--mantine-color-surface-2)',
        backdropFilter: 'blur(10px)',
        boxShadow: 'var(--mantine-shadow-md)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      },
    },
  },

  MenuItem: {
    defaultProps: {
      size: 'xs',
    },
    styles: {
      item: {
        fontSize: rem(14),
        '&[data-hovered]': {
          backgroundColor: 'var(--mantine-color-surface-1)',
        },
      },
    },
  },

  TextInput: {
    defaultProps: {
      size: 'sm',
      labelProps: {
        style: {
          fontSize: rem(14),
          fontWeight: 500,
          color: 'var(--mantine-color-dimmed)',
          marginBottom: rem(4),
        },
      },
    },
    styles: {
      input: {
        fontSize: rem(14),
        fontWeight: 500,
        color: 'var(--mantine-color-text)',
        backgroundColor: 'var(--mantine-color-surface-1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '&:focus': {
          borderColor: 'var(--mantine-color-anchor)',
        },
      },
    },
  },

  NumberInput: {
    defaultProps: {
      size: 'sm',
      labelProps: {
        style: {
          fontSize: rem(14),
          fontWeight: 500,
          color: 'var(--mantine-color-dimmed)',
          marginBottom: rem(4),
        },
      },
    },
    styles: {
      input: {
        fontSize: rem(14),
        fontWeight: 500,
        color: 'var(--mantine-color-text)',
        backgroundColor: 'var(--mantine-color-surface-1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '&:focus': {
          borderColor: 'var(--mantine-color-anchor)',
        },
      },
    },
  },

  Select: {
    defaultProps: {
      size: 'sm',
      labelProps: {
        style: {
          fontSize: rem(14),
          fontWeight: 500,
          color: 'var(--mantine-color-dimmed)',
          marginBottom: rem(4),
        },
      },
    },
    styles: {
      input: {
        fontSize: rem(14),
        fontWeight: 500,
        color: 'var(--mantine-color-white)',
        backgroundColor: 'var(--mantine-color-surface-3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
      dropdown: {
        backgroundColor: 'var(--mantine-color-surface-3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
      item: {
        '&[data-selected]': {
          backgroundColor: 'var(--mantine-color-primary-filled)',
          color: 'var(--mantine-color-white)',
        },
        '&[data-hovered]': {
          backgroundColor: 'var(--mantine-color-surface-3)',
        },
      },
    },
  },

  Checkbox: {
    defaultProps: {
      size: 'sm',
    },
    styles: {
      label: {
        fontSize: rem(14),
        fontWeight: 400,
      },
    },
  },

  Radio: {
    defaultProps: {
      size: 'sm',
    },
    styles: {
      label: {
        fontSize: rem(14),
        fontWeight: 400,
      },
    },
  },

  Switch: {
    defaultProps: {
      size: 'sm',
    },
    styles: {
      label: {
        fontSize: rem(14),
        fontWeight: 400,
      },
    },
  },

  Modal: {
    defaultProps: {
      padding: 0,
      radius: 'md',
      size: 'sm',
      centered: true,
      shadow: 'xl',
      lockScroll: true,
      closeOnEscape: true,
      trapFocus: true,
      withinPortal: true,
      returnFocus: true,
      overlayProps: {
        opacity: 0.75,
        blur: 3,
        color: '#000',
      },
    },
    styles: (theme: any) => ({
      root: {
        // Ensures modal appears above other elements
        zIndex: 300,
      },
      inner: {
        padding: rem(16),
      },
      header: {
        padding: `${rem(16)} ${rem(24)}`,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'var(--mantine-color-surface-2)',
        borderTopLeftRadius: theme.radius.md,
        borderTopRightRadius: theme.radius.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      title: {
        fontSize: rem(18),
        fontWeight: 600,
        color: 'var(--mantine-color-bright)',
        lineHeight: 1.3,
        margin: 0,
      },
      body: {
        padding: rem(16),
        backgroundColor: 'var(--mantine-color-surface-1)',
        fontSize: rem(15),
        color: 'var(--mantine-color-text)',
        lineHeight: 1.5,
      },
      close: {
        color: 'var(--mantine-color-dimmed)',
        width: rem(28),
        height: rem(28),
        borderRadius: theme.radius.sm,
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          color: 'var(--mantine-color-bright)',
        },
      },
      content: {
        boxShadow: theme.shadows.xl,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 40px)',
        '@media (max-width: 36em)': {
          width: 'calc(100vw - 30px)',
          margin: '0 auto',
        },
      },
      overlay: {
        backdropFilter: 'blur(3px)',
      },
    }),
  },

  Table: {
    defaultProps: {
      withTableBorder: true,
      withColumnBorders: false,
      highlightOnHover: true,
      horizontalSpacing: 'xs',
      verticalSpacing: 'xs',
      fontSize: 'xs',
    },
    styles: {
      th: {
        fontSize: rem(14),
        fontWeight: 600,
        color: 'var(--mantine-color-bright)',
        backgroundColor: 'var(--mantine-color-surface-2)',
        padding: `${rem(10)} ${rem(14)}`,
      },
      td: {
        fontSize: rem(16),
        padding: `${rem(8)} ${rem(14)}`,
        borderColor: 'rgba(255, 255, 255, 0.08)',
      },
    },
  },

  SegmentedControl: {
    defaultProps: {
      radius: 'sm',
      p: 0,
      size: 'xs',
    },
    styles: (theme: any) => ({
      root: {
        backgroundColor: 'var(--mantine-color-surface-2)',
      },
    }),
  },

  Tooltip: {
    defaultProps: {
      withArrow: true,
      arrowSize: 6,
      offset: 10,
      position: 'top',
      color: 'dark',
      transitionProps: { transition: 'fade', duration: 200 },
      events: { hover: true, focus: true, touch: false },
    },
    styles: (theme: any) => ({
      tooltip: {
        backgroundColor: 'var(--mantine-color-surface-2)',
        color: 'var(--mantine-color-text)',
        fontSize: rem(14),
        fontWeight: 500,
        padding: `${rem(8)} ${rem(12)}`,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: theme.shadows.sm,
      },
      arrow: {
        backgroundColor: 'var(--mantine-color-surface-2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    }),
  },

  Tabs: {
    defaultProps: {
      color: 'primary',
      size: 'xs',
    },
    styles: () => ({
      root: {
        // Add any root styles if needed
      },
      list: {
        gap: rem(6),
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: `0 ${rem(2)}`,
      },
      tab: {
        fontSize: rem(12),
        fontWeight: 500,
        color: 'var(--mantine-color-dimmed)',
        padding: `${rem(4)} ${rem(10)}`,
        height: rem(28),
        transition: 'background-color 150ms ease, color 150ms ease',

        '&[data-active]': {
          color: 'var(--mantine-color-bright)',
          fontWeight: 600,
        },

        '&:hover': {
          backgroundColor: 'var(--mantine-color-surface-1)',
          color: 'var(--mantine-color-text)',
        },
      },
      tabLabel: {
        lineHeight: 1.2,
      },
      tabSection: {
        fontSize: rem(14),
      },
      panel: {
        padding: `${rem(8)} ${rem(4)}`,
      },
    }),
  },
};
