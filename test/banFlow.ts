import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { TestObjectType } from './app.e2e-spec';

export function banFlow(testObject: TestObjectType) {
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

  describe('BanFlow', () => {
    let commentId1 = '';
    let commentId2 = '';
    let commentId3 = '';
    const blogId1 = '';
    const blogId2 = '';
    const blogId3 = '';
    const postId1 = '';
    const postId2 = '';
    const postId3 = '';
    let postIdByBlogId = '';
    const notFound = '63f0e789e8f1762c4ba45f3e';

    /*   it('post new blog1 status 201 (POST /blogger/blogs)', () => {
      return request(app.getHttpServer())
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          name: 'Test blog',
          description: 'My test blog',
          websiteUrl: 'polonezTestBlog.com',
        })
        .expect(201)
        .expect((res) => {
          blogId1 = res.body.id;
          expect(res.body).toEqual({
            id: expect.any(String),
            name: 'Test blog',
            description: 'My test blog',
            websiteUrl: 'polonezTestBlog.com',
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          });
        });
    });

    it('post new blog2 status 201 (POST /blogger/blogs)', () => {
      return request(app.getHttpServer())
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          name: 'Test blog',
          description: 'My test blog',
          websiteUrl: 'polonezTestBlog.com',
        })
        .expect(201)
        .expect((res) => {
          blogId2 = res.body.id;
          expect(res.body).toEqual({
            id: expect.any(String),
            name: 'Test blog',
            description: 'My test blog',
            websiteUrl: 'polonezTestBlog.com',
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          });
        });
    });

    it('post new blog3 status 201 (POST /blogger/blogs)', () => {
      return request(app.getHttpServer())
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          name: 'Test blog',
          description: 'My test blog',
          websiteUrl: 'polonezTestBlog.com',
        })
        .expect(201)
        .expect((res) => {
          blogId3 = res.body.id;
          expect(res.body).toEqual({
            id: expect.any(String),
            name: 'Test blog',
            description: 'My test blog',
            websiteUrl: 'polonezTestBlog.com',
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          });
        });
    });

    it('post new post by id blog2 status 201 (POST /blogger/blogs/:id/posts)', () => {
      return request(app.getHttpServer())
        .post(`/blogger/blogs/${blogId2}/posts`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          title: 'Test post by blog',
          shortDescription: 'My test post by blog',
          content: 'My test content by blog',
        })
        .expect(201)
        .expect((res) => {
          postId2 = res.body.id;
        });
    });

    it('post new post by id blog3 status 201 (POST /blogger/blogs/:id/posts)', () => {
      return request(app.getHttpServer())
        .post(`/blogger/blogs/${blogId3}/posts`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          title: 'Test post by blog',
          shortDescription: 'My test post by blog',
          content: 'My test content by blog',
        })
        .expect(201)
        .expect((res) => {
          postId3 = res.body.id;
        });
    });

    it('post new post by id blog1 status 201 (POST /blogger/blogs/:id/posts)', () => {
      return request(app.getHttpServer())
        .post(`/blogger/blogs/${blogId1}/posts`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          title: 'Test post by blog',
          shortDescription: 'My test post by blog',
          content: 'My test content by blog',
        })
        .expect(201)
        .expect((res) => {
          postId1 = res.body.id;
        });
    });

    it('get post by id blog2 status 200 (GET /posts/:id)', () => {
      return request(app.getHttpServer())
        .get(`/posts/${postId2}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: postId2,
            title: 'Test post by blog',
            shortDescription: 'My test post by blog',
            content: 'My test content by blog',
            blogId: blogId2,
            blogName: 'Test blog',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: expect.any(Number),
              dislikesCount: expect.any(Number),
              myStatus: expect.any(String),
              newestLikes: expect.any(Array),
            },
          });
        });
    });

    it('get id blog2 status 200 (GET /blogs/:id)', () => {
      return request(app.getHttpServer())
        .get(`/blogs/${blogId2}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: blogId2,
            name: 'Test blog',
            description: 'My test blog',
            websiteUrl: 'polonezTestBlog.com',
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          });
        });
    });

    it('ban blog2 status 204 (PUT /sa/blogs/:id/ban)', () => {
      return request(app.getHttpServer())
        .put(`/sa/blogs/${blogId2}/ban`)
        .set('Authorization', `Basic ${testObject.basic}`)
        .send({
          isBanned: true,
        })
        .expect(204);
    });

    it('get post by id blog2 status 404 (GET /posts/:id)', () => {
      return request(app.getHttpServer())
        .get(`/posts/${blogId2}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(404);
    });

    it('get blog by id blog2 status 404 (GET /posts/:id)', () => {
      return request(app.getHttpServer())
        .get(`/blogs/${blogId2}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(404);
    });*/

    it('post new post by id blog status 201 (POST /blogger/blogs/:id/posts)', () => {
      return request(app.getHttpServer())
        .post(`/blogger/blogs/${testObject.blogID}/posts`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          title: 'Test post by blog',
          shortDescription: 'My test post by blog',
          content: 'My test content by blog',
        })
        .expect(201)
        .expect((res) => {
          postIdByBlogId = res.body.id;
        });
    });

    it('get post by id blog status 200 (GET /posts/:id)', () => {
      return request(app.getHttpServer())
        .get(`/posts/${postIdByBlogId}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: postIdByBlogId,
            title: 'Test post by blog',
            shortDescription: 'My test post by blog',
            content: 'My test content by blog',
            blogId: testObject.blogID,
            blogName: 'Test blog',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: expect.any(Number),
              dislikesCount: expect.any(Number),
              myStatus: expect.any(String),
              newestLikes: expect.any(Array),
            },
          });
        });
    });

    it(`put like Polonez of post status 204 /posts/:id/like-status`, () => {
      return request(app.getHttpServer())
        .put(`/posts/${testObject.postID}/like-status`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(204);
    });

    it('post new comment by id post status 201 (POST /posts/:id/comments)', () => {
      return request(app.getHttpServer())
        .post(`/posts/${postIdByBlogId}/comments`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          content: 'My test content by comment',
        })
        .expect(201)
        .expect((res) => {
          commentId1 = res.body.id;
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
    it('post new comment by id post status 201 (POST /posts/:id/comments)', () => {
      return request(app.getHttpServer())
        .post(`/posts/${postIdByBlogId}/comments`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          content: 'My test content by comment',
        })
        .expect(201)
        .expect((res) => {
          commentId2 = res.body.id;
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
    it('post new comment by id post status 201 (POST /posts/:id/comments)', () => {
      return request(app.getHttpServer())
        .post(`/posts/${postIdByBlogId}/comments`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          content: 'My test content by comment',
        })
        .expect(201)
        .expect((res) => {
          commentId3 = res.body.id;
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

    it('ban user status 204 (PUT /sa/users/:id/ban)', () => {
      return request(app.getHttpServer())
        .put(`/sa/users/${testObject.userID}/ban`)
        .set('Authorization', `Basic ${testObject.basic}`)
        .send({
          isBanned: true,
          banReason: 'stringstringstringst',
        })
        .expect(204);
    });

    it('post new post by id blog status 401 (POST /blogger/blogs/:id/posts)', () => {
      return request(app.getHttpServer())
        .post(`/blogger/blogs/${testObject.blogID}/posts`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          title: 'Test post by blog',
          shortDescription: 'My test post by blog',
          content: 'My test content by blog',
        })
        .expect(401);
    });

    it('login ban user status 401 (POST /auth/login)', () => {
      return request(app.getHttpServer())
        .post(`/auth/login`)
        .send({
          loginOrEmail: 'Polonez',
          password: 'pass1234',
        })
        .expect(401);
    });

    it('get id comment status 404 (GET /comments/:id)', () => {
      return request(app.getHttpServer())
        .get(`/comments/${commentId1}`)
        .expect(404);
    });

    it('unban user status 204 (PUT /sa/users/:id/ban)', () => {
      return request(app.getHttpServer())
        .put(`/sa/users/${testObject.userID}/ban`)
        .set('Authorization', `Basic ${testObject.basic}`)
        .send({
          isBanned: false,
          banReason: 'stringstringstringst',
        })
        .expect(204);
    });

    it('login unban user status 200 (POST /auth/login)', () => {
      return request(app.getHttpServer())
        .post(`/auth/login`)
        .send({
          loginOrEmail: 'Polonez',
          password: 'pass1234',
        })
        .expect(200);
    });

    it('get id comment status 200 (GET /comments/:id)', () => {
      return request(app.getHttpServer())
        .get(`/comments/${commentId1}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(200);
    });
  });
}
