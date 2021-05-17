const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

/**
 * [setting path] パスの設定
 * dir.root              [（gulpfile.js を起点とした）ドキュメントルートの位置]
 * dir.theme             [（dir.root を起点とした）WordPressテーマの位置]
 * dir.sass              [Sass ファイルを格納するディレクトリ名]
 * dir.css               [CSS ファイルを格納するディレクトリ名]
 * config.pathDev.sass   [開発環境の Sass ファイルを格納するディレクトリまでのパス]
 * config.pathProd.css   [本番用の CSS ファイルを格納するディレクトリまでのパス]
 */

/**
 * [setting project] プロジェクトの設定
 * config.project.character [文字コードを設定]
 * config.project.browsers  [対象ブラウザ・OSの設定]
 */

const dir = {
    root: '../docs/',
    sass: 'scss',
};

const config = {
    pathDev: {
        sass: dir.sass + '/'
    },
    pathProd: {
        css: 'css'
    },
    project: {
        lfCode: 'LF',
        character: 'UTF-8'
    }
};


// sassタスク
gulp.task('sass', () => {
    return gulp.src(config.pathDev.sass + '/*.scss')
    .pipe(plugins.sass())
    .pipe(plugins.stylelint({
        fix: true
    }))
    .pipe(plugins.plumber()) // エラー時にgulpが止まらない
    .pipe(plugins.autoprefixer({ // ベンダープリフィックスの自動付与
        cascade: false,
        grid: true
    }))
    .pipe(plugins.lineEndingCorrector({ // 改行コード変更
        verbose: false,
        encoding: config.project.character,
        eolc: config.project.lfCode
    }))
    .pipe(plugins.convertEncoding({ // 文字コード変更
        to: config.project.character
    }))
    // .pipe(plugins.header('@charset "UTF-8";\n\n'))
    .pipe(gulp.dest(dir.root + config.pathProd.css));
});

gulp.task('watch', () => {
    gulp.watch(dir.sass + '/*.scss', gulp.task('sass'));
});

// watchタスク実行
gulp.task('default', gulp.task('watch'));
