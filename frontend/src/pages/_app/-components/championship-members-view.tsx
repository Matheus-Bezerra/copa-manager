import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { CopyIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { FormErrorMessage } from '@/components/form-error-message';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContentLoading } from '@/components/content-loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  fetchMembersQueryKey,
  useFetchMembers,
} from '@/http/hooks/members/use-fetch-members';
import { useInviteMember } from '@/http/hooks/members/use-invite-member';
import { useRemoveMember } from '@/http/hooks/members/use-remove-member';
import { useUpdateMemberRole } from '@/http/hooks/members/use-update-member-role';
import type { ChampionshipRole, InvitationRole, Member } from '@/http/types/members/member';
import { z as zod } from '@/lib/zod';
import { useAuthStore } from '@/stores/auth-store';
import { errorHandler } from '@/utils/error-handler';
import { useQueryClient } from '@tanstack/react-query';

const inviteMemberSchema = zod.object({
  email: zod.email(),
  role: zod.enum(['ADMINISTRATOR', 'ORGANIZER']),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

const roleLabels: Record<ChampionshipRole, string> = {
  OWNER: 'Proprietário',
  ADMINISTRATOR: 'Administrador',
  ORGANIZER: 'Organizador',
};

const roleBadgeVariant: Record<
  ChampionshipRole,
  'default' | 'secondary' | 'outline'
> = {
  OWNER: 'default',
  ADMINISTRATOR: 'secondary',
  ORGANIZER: 'outline',
};

function getApiErrorCode(error: unknown): string | undefined {
  const axiosError = error as AxiosError<{ code?: string; error?: { code: string } }>;
  return axiosError.response?.data?.error?.code ?? axiosError.response?.data?.code;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

type ChampionshipMembersViewProps = {
  championshipId: string;
  ownerUserId: string;
};

export function ChampionshipMembersView({
  championshipId,
  ownerUserId,
}: ChampionshipMembersViewProps) {
  const user = useAuthStore((state) => state.user);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data, isPending, isError, error } = useFetchMembers(championshipId);

  useEffect(() => {
    if (isError && error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }, [isError, error]);

  const members = data?.members ?? [];
  const isOwner = !!user && ownerUserId === user.id;
  const currentMember = members.find((member) => member.userId === user?.id);
  const canManage = isOwner || currentMember?.role === 'ADMINISTRATOR';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Membros</h3>
          <p className="text-muted-foreground text-xs">
            {members.length} {members.length === 1 ? 'membro' : 'membros'}
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlusIcon className="size-4" />
            Convidar
          </Button>
        )}
      </div>

      {isPending && <ContentLoading variant="list" />}

      {!isPending && !isError && members.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">Nenhum membro encontrado.</p>
      )}

      {!isPending && !isError && members.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Papel</TableHead>
              {canManage && <TableHead className="w-24 text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                championshipId={championshipId}
                isOwner={isOwner}
                canManage={canManage}
                isSelf={member.userId === user?.id}
              />
            ))}
          </TableBody>
        </Table>
      )}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        championshipId={championshipId}
      />
    </div>
  );
}

type MemberRowProps = {
  member: Member;
  championshipId: string;
  isOwner: boolean;
  canManage: boolean;
  isSelf: boolean;
};

function MemberRow({ member, championshipId, isOwner, canManage, isSelf }: MemberRowProps) {
  const queryClient = useQueryClient();

  const { mutateAsync: updateRole, isPending: isUpdatingRole } = useUpdateMemberRole({
    mutation: {
      onError: (error) => {
        const { code, description } = errorHandler(error);
        toast.error(code, { description });
      },
    },
  });

  const { mutateAsync: removeMember, isPending: isRemoving } = useRemoveMember({
    mutation: {
      onError: (error) => {
        const { code, description } = errorHandler(error);
        toast.error(code, { description });
      },
    },
  });

  const canChangeRole = isOwner && !isSelf && member.role !== 'OWNER';
  const canRemove = canManage && member.role !== 'OWNER';

  async function handleRoleChange(role: InvitationRole) {
    await updateRole({
      championshipId,
      memberId: member.id,
      data: { role },
    });
    await queryClient.invalidateQueries({ queryKey: fetchMembersQueryKey(championshipId) });
    toast.success('Papel atualizado');
  }

  async function handleRemove() {
    await removeMember({ championshipId, memberId: member.id });
    await queryClient.invalidateQueries({ queryKey: fetchMembersQueryKey(championshipId) });
    toast.success('Membro removido');
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="bg-link/15 text-link flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {getInitials(member.user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{member.user.name}</p>
            <p className="text-muted-foreground truncate text-xs">{member.user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {canChangeRole ? (
          <Select
            value={member.role}
            disabled={isUpdatingRole}
            onValueChange={(value) => void handleRoleChange(value as InvitationRole)}
          >
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMINISTRATOR">Administrador</SelectItem>
              <SelectItem value="ORGANIZER">Organizador</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={roleBadgeVariant[member.role]}>{roleLabels[member.role]}</Badge>
        )}
      </TableCell>
      {canManage && (
        <TableCell className="text-right">
          {canRemove ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" disabled={isRemoving}>
                  <Trash2Icon className="text-destructive size-4" />
                  <span className="sr-only">Remover membro</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>{member.user.name}</strong> perderá o acesso a este campeonato.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isRemoving}
                    onClick={(event) => {
                      event.preventDefault();
                      void handleRemove();
                    }}
                  >
                    {isRemoving ? 'Removendo…' : 'Remover'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </TableCell>
      )}
    </TableRow>
  );
}

type InviteMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  championshipId: string;
};

function InviteMemberDialog({ open, onOpenChange, championshipId }: InviteMemberDialogProps) {
  const queryClient = useQueryClient();
  const [inviteResult, setInviteResult] = useState<{
    inviteUrl: string;
    email: string;
    emailSent: boolean;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'ORGANIZER',
    },
  });

  const selectedRole = watch('role');

  const { mutateAsync: inviteMember, isPending } = useInviteMember({
    mutation: {
      onError: (error) => {
        const code = getApiErrorCode(error);

        if (code === 'CHAMPIONSHIP/INVITATION_ALREADY_PENDING') {
          toast.error('Convite pendente', {
            description: 'Já existe um convite pendente para este e-mail.',
          });
          return;
        }

        const { code: errorCode, description } = errorHandler(error);
        toast.error(errorCode, { description });
      },
    },
  });

  async function onSubmit(formData: InviteMemberFormData) {
    const result = await inviteMember({
      championshipId,
      data: formData,
    });

    await queryClient.invalidateQueries({ queryKey: fetchMembersQueryKey(championshipId) });

    setInviteResult({
      inviteUrl: result.invitation.inviteUrl,
      email: formData.email,
      emailSent: result.emailSent,
    });

    if (result.emailSent) {
      toast.success('Convite criado', {
        description: 'E-mail enviado. Você também pode copiar o link abaixo.',
      });
    } else {
      toast.warning('Convite criado', {
        description: 'O e-mail não foi enviado. Copie o link e compartilhe manualmente.',
      });
    }
  }

  async function handleCopyInviteUrl() {
    if (!inviteResult) return;

    try {
      await navigator.clipboard.writeText(inviteResult.inviteUrl);
      toast.success('Link copiado');
    } catch {
      toast.error('Não foi possível copiar o link');
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setInviteResult(null);
    }
    onOpenChange(nextOpen);
  }

  function handleCloseSuccess() {
    reset();
    setInviteResult(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {inviteResult ? (
          <>
            <DialogHeader>
              <DialogTitle>Convite criado</DialogTitle>
              <DialogDescription>
                {inviteResult.emailSent
                  ? `Enviamos o convite para ${inviteResult.email}. Você também pode copiar o link e enviar por WhatsApp ou outro canal.`
                  : `O e-mail para ${inviteResult.email} não foi enviado automaticamente. Copie o link abaixo e compartilhe manualmente.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="invite-link">Link do convite</Label>
              <div className="flex gap-2">
                <Input id="invite-link" readOnly value={inviteResult.inviteUrl} className="font-mono text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={handleCopyInviteUrl}>
                  <CopyIcon className="size-4" />
                  <span className="sr-only">Copiar link</span>
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleCloseSuccess}>
                Concluir
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Convidar membro</DialogTitle>
              <DialogDescription>
                Envie um convite por e-mail e compartilhe o link por WhatsApp ou outro canal.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">E-mail</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="usuario@email.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FormErrorMessage message={errors.email?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Papel</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setValue('role', value as InvitationRole, { shouldValidate: true })
              }
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMINISTRATOR">Administrador</SelectItem>
                <SelectItem value="ORGANIZER">Organizador</SelectItem>
              </SelectContent>
            </Select>
            <FormErrorMessage message={errors.role?.message} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <ButtonLoading type="submit" loading={isPending}>
              Enviar convite
            </ButtonLoading>
          </div>
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
