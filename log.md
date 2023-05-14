# 課題1

## index.htmlの場所確認
```
/usr/local/apache2/conf# cat httpd.conf | grep DocumentRoot
```
でDocumentRootを確認する
index.htmlのディレクトリを覚えておく

# 課題2
/etc/httpd/conf/httpd.conf

パスワードファイル作成
```
htdigest -c /usr/local/apache2/conf/.digestpass "Digest Auth" aws
```


LoadModule auth_digest_module modules/mod_auth_digest.so
LoadModule rewrite_module modules/mod_rewrite.so
のコメントを外す


DocumentRoot "/usr/local/apache2/htdocs"
<Directory "/usr/local/apache2/htdocs">
/usr/local/apache2/htdocs -> /var/www/html
の/var/www/htmlの領域設定のAllowOverrideをNone→ALLに変更



# 課題3
Typescriptを使用して作成
## プロジェクトの初期化
```
yarn init -y
```

## packageをインストール
```
yarn add promise-mysql @types/mysql express
yarn add -D typescript ts-node @types/express @types/node
```

## package.jsonに追記
```
{
...
  "main": "src/app.ts",
  "scripts": {
    "build": "tsc",
    "start": "nodemon"
  }
...
}
```