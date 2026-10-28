import TabsLayout from '../../app/(tabs)/_layout';
import Emergency from '../../app/(tabs)/emergency';
import Home from '../../app/(tabs)/home';
import Profile from '../../app/(tabs)/profile';
import Quiz from '../../app/(tabs)/quiz';
import Reminders from '../../app/(tabs)/reminders';
import NotFound from '../../app/+not-found';
import RootLayout from '../../app/_layout';
import Index from '../../app/index';
import QuizSessionRoute from '../../app/quiz/session';
import QuizResultRoute from '../../app/quiz/result/[attemptId]';
import ArticleRoute from '../../app/articles/[id]';

export const appRoutes = {
  _layout: RootLayout, index: Index, '+not-found': NotFound, 'articles/[id]': ArticleRoute, 'quiz/session': QuizSessionRoute, 'quiz/result/[attemptId]': QuizResultRoute,
  '(tabs)/_layout': TabsLayout, '(tabs)/home': Home, '(tabs)/quiz': Quiz,
  '(tabs)/reminders': Reminders, '(tabs)/emergency': Emergency, '(tabs)/profile': Profile,
};
