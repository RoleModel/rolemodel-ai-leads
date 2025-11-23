'use client'

const styles = {
  topBar: {
    height: '56px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '0 var(--op-space-medium)',
    borderBottom: '1px solid var(--op-color-neutral-plus-five)',
    backgroundColor: 'var(--op-color-neutral-plus-seven)',
    gap: 'var(--op-space-medium)',
    fontSize: 'var(--op-font-small)',
    color: 'var(--op-color-neutral-on-plus-eight)',
    flexShrink: 0,
  },
  logoBlock: {
    width: '24px',
    height: '24px',
    backgroundColor: 'var(--op-color-primary-base)',
    borderRadius: 'var(--op-radius-small)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--op-color-primary-on-base)',
    fontWeight: 700,
    fontSize: '14px',
  },
  breadcrumbItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--op-space-small)',
    fontWeight: 500,
  },
  badgePill: {
    border: '1px solid var(--op-color-border)',
    borderRadius: '99px',
    padding: '2px 8px',
    fontSize: '11px',
    color: 'var(--op-color-neutral-on-plus-max)',
    fontWeight: 400,
  },
  breadcrumbSeparator: {
    color: 'var(--op-color-neutral-on-plus-max)',
  },
}

export function TopBar() {
  return (
    <header style={styles.topBar}>
      <div style={styles.logoBlock}>C</div>

      <div style={styles.breadcrumbItem}>
        <span>Dallas Peters works...</span>
        <span style={styles.badgePill}>Free</span>
      </div>

      <span style={styles.breadcrumbSeparator}>/</span>

      <div style={styles.breadcrumbItem}>
        <span>RoleModel Software</span>
        <span style={styles.badgePill}>Agent</span>
      </div>
    </header>
  )
}
