"use client";

import { Screen } from "@/components/screen";
import { useSeller } from "@/components/seller-provider";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, CheckBox, EmptyState } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/field";
import { Drawer, Modal } from "@/components/ui/overlay";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { ROLE_ACCESS } from "@/lib/mock";
import { formatDateTime } from "@/lib/format";
import type { AccessKey, Employee, Role } from "@/lib/types";
import { Users } from "lucide-react";
import { useState } from "react";

const ROLES: Role[] = ["manager", "content", "marketer", "finance", "owner"];
const ACCESS: AccessKey[] = ["orders", "products", "returns", "reviews", "promotion", "analytics", "finance", "settings", "ai"];

export function TeamView() {
  const { t, locale, employees, activity, addEmployee, updateEmployee } = useSeller();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Employee | null>(null);

  return (
    <Screen title={t.team.title} subtitle={t.team.subtitle} actions={<Button onClick={() => setOpen(true)}>{t.team.add}</Button>}>
      {employees.length === 0 ? <EmptyState icon={<Users className="size-5" />} title={t.team.empty} /> : (
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>{t.team.colName}</Th>
                  <Th>{t.team.colRole}</Th>
                  <Th>{t.team.colStatus}</Th>
                  <Th className="hidden md:table-cell">{t.team.colSeen}</Th>
                  <Th className="hidden lg:table-cell">{t.team.colAccess}</Th>
                </tr>
              </thead>
              <tbody>
                {employees.map((person) => (
                  <tr key={person.id} className="cursor-pointer hover:bg-tawfiq-50/50" onClick={() => setEdit(person)}>
                    <Td>
                      <span className="flex items-center gap-3">
                        <Avatar name={person.name} />
                        <span>
                          <span className="block font-medium">{person.name}</span>
                          <span className="text-xs text-muted">{person.email}</span>
                        </span>
                      </span>
                    </Td>
                    <Td>{t.team.roles[person.role]}</Td>
                    <Td><StatusBadge status={person.status} label={person.status === "active" ? t.status.active : t.status.invited} /></Td>
                    <Td className="hidden md:table-cell text-muted">{person.lastSeen ? formatDateTime(person.lastSeen, locale) : t.team.never}</Td>
                    <Td className="hidden lg:table-cell text-muted">{person.access.map((key) => t.team.accessKeys[key]).join(", ")}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </div>
      )}
      <section>
        <h2 className="mb-3 font-semibold">{t.team.activity}</h2>
        <ol className="space-y-2">
          {activity.map((item) => (
            <li key={item.id} className="rounded-xl border border-line bg-white px-3 py-3 text-sm shadow-card">
              <p>{item.text[locale]}</p>
              <p className="mt-1 text-xs text-muted">{formatDateTime(item.at, locale)}</p>
            </li>
          ))}
        </ol>
      </section>
      <Invite open={open} onClose={() => setOpen(false)} onSave={addEmployee} />
      <Drawer open={Boolean(edit)} onClose={() => setEdit(null)} title={edit?.name ?? ""} description={edit ? t.team.roles[edit.role] : undefined}>
        {edit && (
          <AccessEditor
            employee={edit}
            onChange={(access) => {
              updateEmployee(edit.id, { access });
              setEdit({ ...edit, access });
            }}
          />
        )}
      </Drawer>
    </Screen>
  );
}

function Invite({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (employee: Omit<Employee, "id" | "storeId" | "status" | "lastSeen">) => void }) {
  const { t } = useSeller();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("manager");
  const [access, setAccess] = useState<AccessKey[]>([...ROLE_ACCESS.manager]);
  return (
    <Modal open={open} onClose={onClose} title={t.team.formTitle} description={t.team.formText}>
      <form className="space-y-3" onSubmit={(event) => {
        event.preventDefault();
        if (!name || !email) return;
        onSave({ name, email, role, access });
        onClose();
      }}>
        <Field label={t.team.name}><Input value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <Field label={t.team.email}><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
        <Field label={t.team.role}>
          <Select ariaLabel={t.team.role} value={role} onChange={(value) => { const next = value as Role; setRole(next); setAccess([...ROLE_ACCESS[next]]); }} options={ROLES.map((item) => ({ value: item, label: t.team.roles[item] }))} />
        </Field>
        <p className="text-sm text-muted">{t.team.roleHint[role]}</p>
        <AccessList access={access} locked={role === "owner"} onChange={setAccess} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>{t.common.cancel}</Button>
          <Button type="submit">{t.team.invite}</Button>
        </div>
      </form>
    </Modal>
  );
}

function AccessEditor({ employee, onChange }: { employee: Employee; onChange: (access: AccessKey[]) => void }) {
  const { t } = useSeller();
  return (
    <div>
      {employee.role === "owner" && <p className="mb-3 text-sm text-muted">{t.team.ownerLock}</p>}
      <AccessList access={employee.access} locked={employee.role === "owner"} onChange={onChange} />
    </div>
  );
}

function AccessList({ access, locked, onChange }: { access: AccessKey[]; locked: boolean; onChange: (access: AccessKey[]) => void }) {
  const { t } = useSeller();
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t.team.access}</p>
      {ACCESS.map((key) => (
        <label key={key} className="flex items-center gap-2 text-sm">
          <CheckBox
            label={t.team.accessKeys[key]}
            checked={locked || access.includes(key)}
            onChange={(checked) => {
              if (locked) return;
              onChange(checked ? [...access, key] : access.filter((item) => item !== key));
            }}
          />
          {t.team.accessKeys[key]}
        </label>
      ))}
    </div>
  );
}
