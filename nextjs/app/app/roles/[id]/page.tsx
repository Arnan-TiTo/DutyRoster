import RolePermissionsClient from './client'

export const metadata = {
    title: 'Edit Permissions - Duty Roster'
}

export default async function RolePermissionsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return <RolePermissionsClient roleId={params.id} />
}
