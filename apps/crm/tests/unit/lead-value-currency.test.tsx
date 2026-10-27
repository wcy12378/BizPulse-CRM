import {render,screen} from '@testing-library/react';
import {useForm} from 'react-hook-form';
import {describe,it,expect,vi} from 'vitest';
import {EcoDoValor} from '@/components/kanban/EcoDoValor';
vi.mock('@/hooks/i18n/useLocaleDeData',()=>({useTagDeIdioma:()=> 'en-US'}));
function Example({currency}:{currency:string|null}){
  const form=useForm({defaultValues:{valueReais:'19200'}});
  return <EcoDoValor control={form.control} currency={currency}/>;
}
describe('lead amount currency',()=>{
  it('echoes an existing USD lead in USD rather than BRL',()=>{
    render(<Example currency="USD"/>);
    expect(screen.getByText(/19,200\.00/).textContent).toContain('$');
    expect(screen.getByText(/19,200\.00/).textContent).not.toContain('R$');
  });
  it('does not invent a currency before the server selects it',()=>{
    render(<Example currency={null}/>);
    expect(screen.getByText(/19,200/).textContent).not.toMatch(/R\$|US\$|\$/);
  });
});
