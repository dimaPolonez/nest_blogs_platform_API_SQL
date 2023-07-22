import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TestObjectType } from './app.e2e-spec';
import request from 'supertest';

export function commentFlow(testObject: TestObjectType) {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CommentFlow', () => {
    let deleteCommentId = '';
    let commentId = '';
    const notFound = '63f0e789e8f1762c4ba45f3e';

    it('post new comment by id post status 201 (POST /posts/:id/comments)', () => {
      return request(app.getHttpServer())
        .post(`/posts/${testObject.postID}/comments`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          content: 'My test content by comment',
        })
        .expect(201)
        .expect((res) => {
          commentId = res.body.id;
          expect(res.body).toEqual({
            id: expect.any(String),
            content: 'My test content by comment',
            commentatorInfo: {
              userId: testObject.userID,
              userLogin: 'Polonez',
            },
            createdAt: expect.any(String),
            likesInfo: {
              likesCount: expect.any(Number),
              dislikesCount: expect.any(Number),
              myStatus: expect.any(String),
            },
          });
        });
    });
    it('get id comment status 200 (GET /comments/:id)', () => {
      return request(app.getHttpServer())
        .get(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: commentId,
            content: 'My test content by comment',
            commentatorInfo: {
              userId: testObject.userID,
              userLogin: 'Polonez',
            },
            createdAt: expect.any(String),
            likesInfo: {
              likesCount: expect.any(Number),
              dislikesCount: expect.any(Number),
              myStatus: expect.any(String),
            },
          });
        });
    });
    it('put id comment status 404 (PUT /comments/:id)', () => {
      return request(app.getHttpServer())
        .put(`/comments/${notFound}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          content: 'My test update content',
        })
        .expect(404);
    });

    it('put id comment status 204 (PUT /comments/:id)', () => {
      return request(app.getHttpServer())
        .put(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          content: 'My test update content',
        })
        .expect(204);
    });

    it('get id commentUpdate status 200 (GET /comments/:id)', () => {
      return request(app.getHttpServer())
        .get(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: commentId,
            content: 'My test update content',
            commentatorInfo: {
              userId: testObject.userID,
              userLogin: 'Polonez',
            },
            createdAt: expect.any(String),
            likesInfo: {
              likesCount: expect.any(Number),
              dislikesCount: expect.any(Number),
              myStatus: expect.any(String),
            },
          });
        });
    });
    it('post new deleteComment by id post status 201 (POST /posts/:id/comments)', () => {
      return request(app.getHttpServer())
        .post(`/posts/${testObject.postID}/comments`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          content: 'My test content by deleteComment',
        })
        .expect(201)
        .expect((res) => {
          deleteCommentId = res.body.id;
          expect(res.body).toEqual({
            id: expect.any(String),
            content: 'My test content by deleteComment',
            commentatorInfo: {
              userId: testObject.userID,
              userLogin: 'Polonez',
            },
            createdAt: expect.any(String),
            likesInfo: {
              likesCount: expect.any(Number),
              dislikesCount: expect.any(Number),
              myStatus: expect.any(String),
            },
          });
        });
    });

    it('delete comment status 404 (DELETE /comments/:id)', () => {
      return request(app.getHttpServer())
        .delete(`/comments/${notFound}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(404);
    });

    it('delete blog status 204 (DELETE /comments/:id)', () => {
      return request(app.getHttpServer())
        .delete(`/comments/${deleteCommentId}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(204);
    });

    it('get id postDelete status 404 (GET /posts/:id)', () => {
      return request(app.getHttpServer())
        .get(`/posts/${deleteCommentId}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(404);
    });
  });
}
