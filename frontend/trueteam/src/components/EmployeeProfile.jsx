import React, { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { api } from '../services/api'

const tabs = ['Overview', 'Personal', 'Professional', 'Contact', 'Emergency Contact', 'Documents']

const timeline = [
    { text: 'Joined the company', date: 'Recently' },
]

const documents = ['Employment Contract.pdf', 'Offer Letter.pdf', 'ID Proof.pdf']

// [key, label, input type] — sirf yahi fields edit hongi
const editFields = [
    ['fullName', 'Full Name', 'text'],
    ['dob', 'Date of Birth', 'date'],
    ['gender', 'Gender', 'text'],
    ['phone', 'Phone', 'tel'],
    ['address', 'Address', 'text'],
    ['emergencyName', 'Emergency Contact Name', 'text'],
    ['emergencyRelation', 'Emergency Relationship', 'text'],
    ['emergencyPhone', 'Emergency Phone', 'tel'],
]

const show = (v) => v || '-'
const fmtDob = (s) =>
    s ? new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'

// backend user -> screen ka object
const toEmp = (u) => ({
    empId: u._id ? u._id.slice(-6).toUpperCase() : '-',
    fullName: u.name || '',
    dob: u.dob || '',
    gender: u.gender || '',
    phone: u.phone || '',
    email: u.email || '',
    department: u.department || '',
    jobTitle: u.jobTitle || '',
    manager: '',
    joiningDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '',
    employmentType: '',
    status: u.status === 'active' ? 'Active' : 'Inactive',
    address: u.address || '',
    emergencyName: u.emergencyName || '',
    emergencyRelation: u.emergencyRelation || '',
    emergencyPhone: u.emergencyPhone || '',
})

const initialsOf = (name) => name.split(' ').map((n) => n[0]).join('').slice(0, 2)

const Avatar = ({ size, text, name }) => (
    <div className={`${size} ${text} flex shrink-0 items-center justify-center rounded-full bg-[#D9A1A0] font-semibold text-[#511820]`}>
        {initialsOf(name)}
    </div>
)

const Card = ({ title, className = '', children }) => (
    <section className={`rounded-xl bg-[#511820] p-5 text-[#F7EDDF] ${className}`}>
        <h2 className="text-[22px] font-semibold">{title}</h2>
        {children}
    </section>
)

function InfoGrid({ items }) {
    return (
        <div className="mt-3 grid grid-cols-2">
            {items.map((item, i) => (
                <div
                    key={item.label}
                    className={`border-t border-[#D9A1A0]/25 py-3 ${item.full ? 'col-span-2' : ''} ${!item.full && i % 2 === 0 ? 'border-r pr-3' : ''} ${!item.full && i % 2 === 1 ? 'pl-4' : ''}`}
                >
                    <p className="text-[15px] text-[#D9A1A0]/80">{item.label}</p>
                    <p className="break-words text-[17px]">{item.value}</p>
                </div>
            ))}
        </div>
    )
}

function EmployeeProfile() {
    const [emp, setEmp] = useState(null)
    const [tab, setTab] = useState('Personal')
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    useEffect(() => {
        api.get('/auth/me')
            .then((res) => setEmp(toEmp(res.data)))
            .catch((err) => setError(err.message))
    }, [])

    const openEdit = () => { setForm(emp); setError(''); setEditing(true) }

    const saveEdit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        try {
            const res = await api.patch('/auth/me', {
                name: form.fullName,
                dob: form.dob,
                gender: form.gender,
                phone: form.phone,
                address: form.address,
                emergencyName: form.emergencyName,
                emergencyRelation: form.emergencyRelation,
                emergencyPhone: form.emergencyPhone,
            })
            setEmp(toEmp(res.data))
            setEditing(false)
            setMessage('Profile updated successfully.')
            setTimeout(() => setMessage(''), 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (!emp) {
        return <div className="px-4 py-6 sm:px-8 lg:px-10">{error ? <p className="text-red-700">{error}</p> : <p>Loading profile...</p>}</div>
    }

    const personal = [
        { label: 'Full Name', value: show(emp.fullName) }, { label: 'Date of Birth', value: fmtDob(emp.dob) },
        { label: 'Gender', value: show(emp.gender) }, { label: 'Phone', value: show(emp.phone) },
        { label: 'Email', value: show(emp.email), full: true },
    ]
    const professional = [
        { label: 'Employee ID', value: show(emp.empId) }, { label: 'Department', value: show(emp.department) },
        { label: 'Job Title', value: show(emp.jobTitle) }, { label: 'Manager', value: show(emp.manager) },
        { label: 'Joining Date', value: show(emp.joiningDate) }, { label: 'Employment Type', value: show(emp.employmentType) },
    ]

    const personalCard = <Card title="Personal Information"><InfoGrid items={personal} /></Card>
    const professionalCard = <Card title="Professional Information"><InfoGrid items={professional} /></Card>
    const timelineCard = (
        <Card title="Timeline" className="self-start">
            <ul className="relative mt-3 space-y-3">
                <span className="absolute bottom-3 left-[5px] top-3 w-px bg-[#D9A1A0]/40" />
                {timeline.map((t) => (
                    <li key={t.text} className="relative flex gap-3 text-base leading-snug">
                        <span className="relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full bg-[#D9A1A0]" />
                        <span>{t.text} <span className="text-[#D9A1A0]">• {t.date}</span></span>
                    </li>
                ))}
            </ul>
        </Card>
    )

    function tabContent() {
        if (tab === 'Personal')
            return <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[32fr_32fr_27fr]">{personalCard}{professionalCard}{timelineCard}</div>

        if (tab === 'Overview')
            return (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card title="Summary">
                        <InfoGrid items={[
                            { label: 'Name', value: show(emp.fullName) }, { label: 'Job Title', value: show(emp.jobTitle) },
                            { label: 'Department', value: show(emp.department) }, { label: 'Status', value: emp.status },
                        ]} />
                    </Card>
                    {timelineCard}
                </div>
            )

        if (tab === 'Professional')
            return <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[32fr_27fr]">{professionalCard}{timelineCard}</div>

        if (tab === 'Contact')
            return (
                <div className="max-w-xl">
                    <Card title="Contact">
                        <InfoGrid items={[
                            { label: 'Phone', value: show(emp.phone) }, { label: 'Email', value: show(emp.email) },
                            { label: 'Address', value: show(emp.address), full: true },
                        ]} />
                    </Card>
                </div>
            )

        if (tab === 'Emergency Contact')
            return (
                <div className="max-w-xl">
                    <Card title="Emergency Contact">
                        <InfoGrid items={[
                            { label: 'Name', value: show(emp.emergencyName) }, { label: 'Relationship', value: show(emp.emergencyRelation) },
                            { label: 'Phone', value: show(emp.emergencyPhone), full: true },
                        ]} />
                    </Card>
                </div>
            )

        return (
            <div className="max-w-xl">
                <Card title="Documents">
                    <ul className="mt-3">
                        {documents.map((d) => (
                            <li key={d} className="flex items-center gap-3 border-t border-[#D9A1A0]/25 py-3">
                                <FileText className="h-4 w-4 text-[#D9A1A0]" />{d}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        )
    }

    return (
        <div className="px-4 pb-10 pt-6 sm:px-8 lg:px-10">

            <p className="text-lg">
                <span className="text-[#48151C]/60">My Profile</span>
                <span className="mx-3 text-[#48151C]/50">/</span>
                <span className="font-semibold">{emp.fullName}</span>
            </p>

            {message && (
                <div className="mt-4 rounded-lg border border-green-500 bg-green-100 p-3 text-sm text-green-800">{message}</div>
            )}

            {/* Header card */}
            <section className="mt-5 flex flex-col gap-5 rounded-xl bg-[#511820] p-6 text-[#F7EDDF] md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-5">
                        <Avatar size="h-[100px] w-[100px]" text="text-3xl" name={emp.fullName} />
                        <div>
                            <h1 className="text-3xl font-bold sm:text-[38px] sm:leading-tight">{emp.fullName}</h1>
                            <p className="text-lg text-[#D9A1A0]">{show(emp.jobTitle)}</p>
                        </div>
                    </div>

                    <div className="grid gap-y-1 border-[#D9A1A0]/30 text-lg sm:ml-4 sm:border-l sm:pl-6 lg:grid-cols-[auto_auto] lg:gap-x-10">
                        <div>
                            <p><span className="text-[#D9A1A0]">Emp ID:</span> {emp.empId}</p>
                            <p><span className="text-[#D9A1A0]">Department:</span> {show(emp.department)}</p>
                            <p><span className="text-[#D9A1A0]">Manager:</span> {show(emp.manager)}</p>
                        </div>
                        <div className="border-[#D9A1A0]/30 lg:border-l lg:pl-6">
                            <p className="text-[#D9A1A0]">Status:</p>
                            <p>{emp.status}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={openEdit}
                    className="h-12 shrink-0 rounded-[10px] bg-[#D9A1A0] px-6 text-lg font-semibold text-[#511820] transition hover:bg-[#e3b4b3]"
                >
                    Edit Profile
                </button>
            </section>

            {/* Tabs */}
            <div role="tablist" className="mt-6 flex gap-1 overflow-x-auto border-b border-[#48151C]/15">
                {tabs.map((t) => (
                    <button
                        key={t}
                        role="tab"
                        aria-selected={tab === t}
                        onClick={() => setTab(t)}
                        className={`whitespace-nowrap rounded-t-lg px-4 py-2.5 text-[19px] transition ${
                            tab === t ? 'border-b-[3px] border-[#D9A1A0] bg-[#D9A1A0]/35' : 'hover:bg-[#D9A1A0]/15'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="mt-6" role="tabpanel">{tabContent()}</div>

            
            {/* Edit popup */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Edit profile">
                    <form onSubmit={saveEdit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-[#511820] p-6 text-[#F7EDDF]">
                        <h2 className="mb-1 text-2xl font-semibold">Edit Profile</h2>
                        <p className="mb-4 text-sm text-[#D9A1A0]">Email, department aur job title sirf HR badal sakta hai.</p>

                        {error && (
                            <div className="mb-3 rounded-lg border border-red-400 bg-red-100 p-2 text-sm text-red-800">{error}</div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            {editFields.map(([key, label, type]) => (
                                <div key={key}>
                                    <label htmlFor={key} className="mb-1 block text-sm text-[#D9A1A0]">{label}</label>
                                    <input
                                        id={key}
                                        type={type}
                                        required={key === 'fullName'}
                                        value={form[key] || ''}
                                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                        className="h-11 w-full rounded-lg border border-[#D9A1A0] bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-[#D9A1A0]"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setEditing(false)} className="h-11 rounded-lg border border-[#D9A1A0] px-5 transition hover:bg-white/5">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="h-11 rounded-lg bg-[#D9A1A0] px-5 font-semibold text-[#511820] transition hover:bg-[#e3b4b3] disabled:opacity-60"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default EmployeeProfile