// useStateとuseEffectという道具をreactから借りてくる
import {useState,useEffect}from"react";
// supabase（データの倉庫）から、supabaseというデータを持ってくる
import{supabase}from "./supabase";
// アプリの起動時に一回だけ、supabaseにデータを取りに行き、メモかエラーをコンソールに表示する。
function App(){
  // 「memos=メモのデータの入る箱」「setMemos=メモが変更されると自動で画面を更新する」最初は空の配列（[]）
  const[memos,setMemos]=useState([]);
  // 初期は空欄。タイトルの入る箱と、画面を更新する関数。
  const[title,setTitle]=useState("");
  // 初期は空欄。本文の入る箱と画面を更新する関数。
  const[content,setContent]=useState("");
  // 編集中のメモのidを記憶する。そのidを更新する。初期は編集していないのでnull（idなし）
  const [editingId,setEditingId]=useState(null);
  // 「useEffect(()=>{
  // <ここに実行したいこと>
  // },[]);」でuseEffectは起動時に一回だけ｛｝内を実行する。最後の[]の書き方でuseEffectの動きが変わる。
  // アプリの起動時に一回だけ(fetchMemos)を実行する
  useEffect(()=>{
    // 下のfetchMemos関数の実行。（supabaseの指定の場所から指定のデータを取ってきて指定の順番に並べる。メモを作成し画面を更新。supabaseからのデータの取得に失敗したらエラーを表示）
    fetchMemos();
  },[]);
  // fetchMemos関数。asyncの宣言をすることで、await（処理が終わるまで先に進まない）が使えるようになる。
  async function fetchMemos(){
    // supabaseからデータを取ってくるまで進まない。取ってきたデータはdataかerrorに入る。error=supabaseとの通信接続が失敗したとき
    // supabaseは常にdataとerrorを返している。（必ず、片方が値、片方はnull）
    // supabase=成功時は{data:[配列],error:null}を返す。supabaseから１つのconstでdataとerrorの２つ同時に箱にそのまま移す。
    // 「.」はメソッドチェーン。前の命令の結果に続けて命令をする。
    const{data,error}=await supabase
    // supabaseの「memos」からデータを取ってくる（場所の指定）
    .from('memos')
    // 「memos」という場所から、「*」すべて取ってくる
    .select('*')
    // 「order=命令」「created_at=supabaseの列（timestamptz=いつ追加されたかという時間情報）」「ascending=＜上昇するという意味＞昇順にするか（並べ方）→falseなので降順」
    // created_atの列をみて、ascending:false順に並べてという命令
    .order('created_at',{ascending:false});
    // もしもerrorの箱に値が入っていたら
    if(error){
      // 「エラー」という文字と「errorの値」を表示
      console.log('エラー',error);
      // エラーが起きたらそれ以上は進まない
      return;
    }
    // dataに値が入っていたら（成功）、setMemos関数を実行（データをmemosの箱に入れ、メモと画面を更新）
    setMemos(data);
  }
  // メモを追加する関数。awaitが使える
  async function addMemo(){
    // もしも「title（タイトルの入力欄）」が空欄ならこれより先は実行しない。
    if(title==="") return;
    // 「supabase=データの倉庫と接続」awaitはinsertが終わるまで待つ。
    // 今回は、insert(メモの追加)なので、error情報が入る受け皿(error)だけがあればいい。(supabaseはエラー情報を[error]という名前で返すため)
    const{error}=await supabase
    // supabaseのmemosという場所へ
       .from('memos')
    // 追加されたメモのタイトル(title)と本文(content)をsuopabaseのmemosテーブルへと追加
       .insert({title: title,content: content });
    // もしもsupabaseからエラー情報が返ってきていたら。
    if(error){
      // エラー情報をコンソールへ表示
      console.log('エラー:',error);
      // 以下に進まず返す
      return;
    }
    // タイトルの入力欄を空にしてリセット
    setTitle("");
    // 本文の入力欄を空にしてリセット
    setContent("");
    // メモを追加したので、画面を更新して最新メモリストを表示
    fetchMemos();
  }
  // メモの削除関数。メモのidを引数にもらう（該当のidのメモを削除する）
  async function deleteMemo(id){
    // supabeseと接続。削除関数なのでエラー情報（失敗）のみ受けとる箱をつくる
    const{error}=await supabase
      // supabaseのmemosという場所
      .from('memos')
      // 下記の条件に合うものを削除する
      .delete()
      // 引数のidと等しいid（列）のメモを対象にする「eq=等しい」
      .eq('id',id);
    // エラー情報がsupabaseから返ってきたらエラーとエラー情報をコンソールに表示して処理を止める
    if(error){
      console.log('エラー:',error);
      return;
    }
    // 最新のメモリストに画面を更新
    fetchMemos();
  }
  // メモを編集してデータを書き換える機能
  async function updateMemo(){
    // タイトルの中身が空なら処理を止める
    if(title==="")return;
    // supabaseと接続する。これが終わるまで先に進まない。supabaseからのエラー情報のみを受け取るerror箱を作る
    const{error}=await supabase
      // supabaseのmemosという場所の
      .from('memos')
      // 以下の指定のメモのデータを書き換える→タイトルと本文
      .update({title:title,content:content})
      // 編集中のメモのidと一致するidのデータを探す（上のupdateで書き換えられる）
      .eq('id',editingId);
      // もしもエラー情報がsupabaseから送られていたら、コンソールにエラーとエラー情報を表示して処理を止める
      if(error){
        console.log('エラー:',error);
        return;
      }
      // 編集中のメモidをリセット（どのメモも編集状態でなくす）
      setEditingId(null);
      // タイトル入力欄を空欄にリセット
      setTitle("");
      // 本文入力欄を空欄にリセット
      setContent("");
      // 最新のメモリスト（データ）をsupabaseから取ってきて画面を更新
      fetchMemos();

  }
  // 「memo=.mapでmemosを加工したもの。id,title,contentを持っている」
  // 編集開始関数。memoの「id,title,content」を引数として受け取る
  function startEdit(memo){
    // 編集中のメモのidを記憶する。（EditingIDを編集中のメモのidに更新する）
    setEditingId(memo.id);
    // タイトルの入力欄へ編集するメモのタイトルを渡す。setTitle,HTMLのvalueのおかげで画面の更新、入力欄の表示タイトルの更新ができる。
    setTitle(memo.title);
    // 本文の入力欄へ編集するメモの本文を渡す。
    setContent(memo.content);
  }
  // 以下の画面の設計図をReactに返す
  return(
    <div>
      <h1>メモアプリ</h1>
      <div>
        {/* タイトル入力欄 */}
        <input 
        // 「value=入力欄に表示される文字」→titleの箱の中身を入力欄の中身と同期する
        value={title}
        // 入力欄の中身が変わるたびonChangeがそれを自動で感知して、入力された情報（入力されたテキスト）をeへとまとめ（「e=イベント情報」）、
        // 入力欄に今入っている文字「e.target.value（イベント情報の中の、target＜操作された情報＞の中のvalue<テキスト>）」を画面を更新(setTitle)する。
        // e.target.valueの情報をsetTitleでtitleの中身を更新→titleとvalueを同期→valueが入力欄にテキストを表示
        onChange={e=>setTitle(e.target.value)}
        // 入力欄に最初に入っている薄い文字・ユーザーへのヒント
        placeholder="タイトル"
        />
        {/* 複数行入力できる入力欄 */}
        <textarea 
          // content(本文)の箱の中のテキストを入力欄の中身と同期する。
          value={content}
          // 入力を自動感知して、入力情報をeへとまとめる。入力情報の中から、テキスト情報を取り出して、画面を更新して表示。
          onChange={e=>setContent(e.target.value)}
          // 入力欄に最初に入っている薄い文字・ユーザーへのヒント
          placeholder="本文"
          />
          {/* 編集中メモのidがなければ（編集モードではなかったら）?へと進み追加ボタンが表示。編集中のメモがあれば（nullでない）:へ進み更新ボタンが表示 */}
          {editingId===null
            // 追加ボタン。クリックされるたび、addMemo関数が実行 。「?=trueの場合」
            ?<button onClick={addMemo}>追加</button>
            // 「:=falseの場合（編集中」更新ボタン。クリックされるとupdateMemo関数が実行。
            :<button onClick={updateMemo}>更新</button>
          }
      </div>
      {/* 順序なしリスト。<li>の親 */}
      <ul>
        {/* memos(オブジェクト)の中からひとつずつ取り出して加工していく。memoというラベルをつけていく */}
        {memos.map((memo)=>(
          // 「key=Reactが各要素を識別する目印」。メモを番号で管理している。
          <li key={memo.id}>
            {/* 該当するデータのtitleとcontentを表示する */}
            <h3>{memo.title}</h3>
            <p>{memo.content}</p>
            {/* 削除ボタンが押されると、クリックされたメモのidを引数に、deleteMemo関数が実行される。 */}
            <button onClick={()=>deleteMemo(memo.id)}>削除</button>
            {/* 編集ボタン、クリックされたメモの情報（id,title,content）を引数にstartEdit関数が実行 */}
            <button onClick={()=>startEdit(memo)}>編集</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;