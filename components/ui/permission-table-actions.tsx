/**
 * Permission-Aware Table Actions Component
 * 
 * A component that renders table actions (view, edit, delete) based on user permissions.
 */

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Download,
  Share
} from 'lucide-react'
import { useCRUDPermissions } from '@/hooks/use-permissions'
import type { Feature } from '@/lib/utils/permissions'

interface TableAction {
  label: string
  icon: ReactNode
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: boolean
  className?: string
}

interface PermissionTableActionsProps {
  feature: Feature
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onCopy?: () => void
  onDownload?: () => void
  onShare?: () => void
  customActions?: TableAction[]
  showDropdown?: boolean
  className?: string
}

export function PermissionTableActions({
  feature,
  onView,
  onEdit,
  onDelete,
  onCopy,
  onDownload,
  onShare,
  customActions = [],
  showDropdown = true,
  className = ''
}: PermissionTableActionsProps) {
  const { canRead, canUpdate, canDelete } = useCRUDPermissions(feature)

  // Build actions array based on permissions
  const actions: TableAction[] = []

  if (onView && canRead) {
    actions.push({
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: onView,
      variant: 'ghost'
    })
  }

  if (onEdit && canUpdate) {
    actions.push({
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: onEdit,
      variant: 'ghost'
    })
  }

  if (onCopy && canRead) {
    actions.push({
      label: 'Copy',
      icon: <Copy className="h-4 w-4" />,
      onClick: onCopy,
      variant: 'ghost'
    })
  }

  if (onDownload && canRead) {
    actions.push({
      label: 'Download',
      icon: <Download className="h-4 w-4" />,
      onClick: onDownload,
      variant: 'ghost'
    })
  }

  if (onShare && canRead) {
    actions.push({
      label: 'Share',
      icon: <Share className="h-4 w-4" />,
      onClick: onShare,
      variant: 'ghost'
    })
  }

  // Add custom actions
  actions.push(...customActions)

  if (onDelete && canDelete) {
    actions.push({
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: 'destructive'
    })
  }

  // If no actions available, don't render anything
  if (actions.length === 0) {
    return null
  }

  // If only one action and not using dropdown, render as button
  if (actions.length === 1 && !showDropdown) {
    const action = actions[0]
    return (
      <Button
        variant={action.variant}
        size="sm"
        onClick={action.onClick}
        disabled={action.disabled}
        className={`h-8 w-8 p-0 ${action.className || ''} ${className}`}
      >
        {action.icon}
      </Button>
    )
  }

  // If multiple actions or dropdown requested, render as dropdown
  if (showDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${className}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {actions.map((action, index) => {
            const isDelete = action.variant === 'destructive'
            const showSeparator = isDelete && index > 0 && actions[index - 1].variant !== 'destructive'
            
            return (
              <div key={action.label}>
                {showSeparator && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={isDelete ? 'text-red-600 focus:text-red-600' : ''}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </DropdownMenuItem>
              </div>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Render as individual buttons
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          className={`h-8 w-8 p-0 ${action.className || ''}`}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  )
}

/**
 * Simple permission-aware button component
 */
interface PermissionButtonProps {
  feature: Feature
  permission: 'create' | 'read' | 'update' | 'delete'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  fallback?: ReactNode
}

export function PermissionButton({
  feature,
  permission,
  children,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'default',
  className = '',
  fallback = null
}: PermissionButtonProps) {
  const { canCreate, canRead, canUpdate, canDelete } = useCRUDPermissions(feature)
  
  const hasPermission = (() => {
    switch (permission) {
      case 'create': return canCreate
      case 'read': return canRead
      case 'update': return canUpdate
      case 'delete': return canDelete
      default: return false
    }
  })()

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </Button>
  )
}
