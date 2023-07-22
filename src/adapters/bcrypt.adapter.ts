import bcrypt from 'bcrypt';
export class BcryptAdapter {
  async hushGenerate(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  public async hushCompare(password: string, hush: string): Promise<boolean> {
    return await bcrypt.compare(password, hush);
  }
}
