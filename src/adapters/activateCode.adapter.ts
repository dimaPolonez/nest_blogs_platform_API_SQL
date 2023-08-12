import { v4 } from 'uuid';
import { add } from 'date-fns';

export class ActiveCodeAdapter {
  public async createCode() {
    return {
      codeActivated: v4(),
      lifeTimeCode: await this.createTime(),
      confirm: false,
    };
  }

  private async createTime(): Promise<string> {
    return add(new Date(), {
      hours: 1,
      minutes: 10,
    }).toString();
  }
}
